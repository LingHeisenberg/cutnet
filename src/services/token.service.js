import jwt from "jsonwebtoken";
import axios from "axios";
import consulta from "../database/conexao.js";
import mikrotiks from "../config/mikrotik.js";

// ========================================
// 🔍 Verificar token do usuário
// ========================================
export async function verificarToken(id) {
  try {
    const sql = "SELECT * FROM tabelausuarios WHERE idUsuario=?";

    const usuarioDb = (await consulta(sql, [id]))[0];

    if (!usuarioDb) {
      console.log("❌ Usuário não encontrado:", id);
      return;
    }

    // Ignorar colaboradores
    if (usuarioDb.tipoUsuario === "colab") {
      console.log(
        `⏭️ Colaborador ignorado: ${usuarioDb.name}`
      );
      return;
    }

    const mikrotik = mikrotiks.find(
      (m) => m.nome === usuarioDb.pop
    );

    if (!mikrotik) {
      console.log(
        `❌ POP não encontrado para ${usuarioDb.name}`
      );
      return;
    }

    jwt.verify(
      usuarioDb.token,
      process.env.CHAVESECRETA,
      async (erro) => {
        if (erro) {
          await desativarUsuario(
            usuarioDb,
            mikrotik,
            id
          );
        } else {
          await ativarUsuario(
            usuarioDb,
            mikrotik,
            id
          );
        }
      }
    );

  } catch (erro) {
    console.log("❌ Erro geral:", erro.message);
  }
}
// ========================================
// 🔴 Desativar usuário
// ========================================
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

    console.log(
      `🔴 TOKEN EXPIRADO → usuário desativado: ${usuarioDb.name}`
    );

  } catch (erro) {

    console.log("\n========================================");
    console.log("❌ ERRO AO DESATIVAR USUÁRIO");
    console.log("👤 Nome:", usuarioDb.name);
    console.log("🆔 ID:", usuarioDb.idUsuario);
    console.log("📡 POP:", usuarioDb.pop);

    if (erro.response) {
      console.log("📄 Status:", erro.response.status);
      console.log("📄 Resposta:", erro.response.data);
    } else {
      console.log("📄 Erro:", erro.message);
    }

    console.log("========================================\n");
  }
}

// ========================================
// 🟢 Ativar usuário
// ========================================
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

    console.log(
      `🟢 TOKEN válido → usuário ativo: ${usuarioDb.name}`
    );

  } catch (erro) {

    console.log("\n========================================");
    console.log("❌ ERRO AO ATIVAR USUÁRIO");
    console.log("👤 Nome:", usuarioDb.name);
    console.log("🆔 ID:", usuarioDb.idUsuario);
    console.log("📡 POP:", usuarioDb.pop);

    if (erro.response) {
      console.log("📄 Status:", erro.response.status);
      console.log("📄 Resposta:", erro.response.data);
    } else {
      console.log("📄 Erro:", erro.message);
    }

    console.log("========================================\n");
  }
}

// ========================================
// 🔌 Remover conexão ativa
// ========================================
async function removerConexaoAtiva(usuarioDb, mikrotik) {
  try {

    const active = await axios.get(
      mikrotik.active,
      getAuth(mikrotik)
    );

    const secret = await axios.get(
      `${mikrotik.url}/${encodeURIComponent(usuarioDb.id)}`,
      getAuth(mikrotik)
    );

    for (const item of active.data) {

      if (item.name === secret.data.name) {

        await axios.delete(
          `${mikrotik.active}/${encodeURIComponent(
            item[".id"]
          )}`,
          getAuth(mikrotik)
        );

        console.log(
          `🔌 Usuário removido do active: ${secret.data.name}`
        );

        break;
      }
    }

  } catch (erro) {

    console.log("\n========================================");
    console.log("❌ ERRO AO REMOVER CONEXÃO ATIVA");
    console.log("👤 Nome:", usuarioDb.name);
    console.log("📡 POP:", usuarioDb.pop);

    if (erro.response) {
      console.log("📄 Status:", erro.response.status);
      console.log("📄 Resposta:", erro.response.data);
    } else {
      console.log("📄 Erro:", erro.message);
    }

    console.log("========================================\n");
  }
}

// ========================================
// 🔐 Autenticação MikroTik
// ========================================
function getAuth(mikrotik) {
  return {
    auth: {
      username: mikrotik.user,
      password: mikrotik.pass,
    },
  };
}