import jwt from "jsonwebtoken";
import axios from "axios";
import consulta from "../database/conexao.js";
import mikrotiks from "../config/mikrotik.js";

export async function verificarToken(id) {
  try {
    // 🔍 Buscar usuário no banco
    const sql = "SELECT * FROM tabelausuarios WHERE idUsuario=?";
    const usuarioDb = (await consulta(sql, [id]))[0];

    if (!usuarioDb) {
      console.log("Usuário não encontrado");
      return;
    }

    // 🔍 Encontrar Mikrotik (POP)
    const mikrotik = mikrotiks.find(m => m.nome === usuarioDb.pop);

    if (!mikrotik) {
      console.log("POP não encontrado");
      return;
    }

    // 🔐 Verificar token
    jwt.verify(
      usuarioDb.token,
      process.env.CHAVESECRETA,
      async (erro) => {
        if (erro) {
          await desativarUsuario(usuarioDb, mikrotik, id);
        } else {
          await ativarUsuario(usuarioDb, mikrotik, id);
        }
      }
    );

  } catch (erro) {
    console.log("Erro geral:", erro.message);
  }
}

// 🔴 Desativar usuário
async function desativarUsuario(usuarioDb, mikrotik, id) {
  try {
    await axios.put(
      `${mikrotik.url}/${encodeURIComponent(usuarioDb.id)}`,
      {
        disabled: "true",
        name: usuarioDb.name,
        password: usuarioDb.password,
        profile: "DESATVADO",
        service: usuarioDb.service,
      },
      getAuth(mikrotik)
    );

    await consulta(
      "UPDATE tabelausuarios SET disabled='true', profile='DESATVADO' WHERE idUsuario=?",
      [id]
    );

    await removerConexaoAtiva(usuarioDb, mikrotik);

    console.log("🔴 TOKEN EXPIRADO → usuário desativado: ", usuarioDb.name);

  } catch (erro) {
    console.log("Erro ao desativar:", erro.message);
  }
}

// 🟢 Ativar usuário
async function ativarUsuario(usuarioDb, mikrotik, id) {
  try {
    await axios.put(
      `${mikrotik.url}/${encodeURIComponent(usuarioDb.id)}`,
      {
        disabled: "false",
        name: usuarioDb.name,
        password: usuarioDb.password,
        profile: usuarioDb.profile,
        service: usuarioDb.service,
      },
      getAuth(mikrotik)
    );

    await consulta(
      "UPDATE tabelausuarios SET disabled='false' WHERE idUsuario=?",
      [id]
    );

    console.log("🟢 TOKEN válido → usuário ativo:", usuarioDb.name);

  } catch (erro) {
    console.log("Erro ao ativar:", erro.message);
  }
}

// 🔌 Remover conexão ativa
async function removerConexaoAtiva(usuarioDb, mikrotik) {
  try {
    const active = await axios.get(mikrotik.active, getAuth(mikrotik));

    const secret = await axios.get(
      `${mikrotik.url}/${encodeURIComponent(usuarioDb.id)}`,
      getAuth(mikrotik)
    );

    for (let item of active.data) {
      if (item.name === secret.data.name) {
        await axios.delete(
          `${mikrotik.active}/${encodeURIComponent(item[".id"])}`,
          getAuth(mikrotik)
        );

        console.log("🔴 Usuário removido do active:", secret.data.name);
        break;
      }
    }

  } catch (erro) {
    console.log("Erro ao remover conexão ativa:", erro.message);
  }
}

// 🔐 Autenticação padrão
function getAuth(mikrotik) {
  return {
    auth: {
      username: mikrotik.user,
      password: mikrotik.pass,
    },
  };
}