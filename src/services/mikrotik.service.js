import axios from "axios";
import mikrotiks from "../config/mikrotik.js";
import consulta from "../database/conexao.js";

// ========================================
// 🔄 Buscar usuários de todos os POPs
// ========================================
export async function buscarUsuariosMikrotik() {
  const usuarios = [];

  const popsOrdenados = [...mikrotiks].sort((a, b) =>
    a.nome.localeCompare(b.nome, "pt")
  );

  for (const mikrotik of popsOrdenados) {
    console.log("\n========================================");
    console.log(`📡 POP: ${mikrotik.nome.toUpperCase()}`);
    console.log("========================================");

    try {
      const auth = Buffer.from(
        `${mikrotik.user}:${mikrotik.pass}`
      ).toString("base64");

      console.log("🔄 Conectando...");
      console.log("🌐 URL:", mikrotik.url);

      const response = await axios.get(mikrotik.url, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Basic ${auth}`,
        },
        timeout: 20000,
      });

      const dados = response.data
        .map((user) => ({
          ...user,
          pop: mikrotik.nome,
        }))
        .sort((a, b) =>
          (a.name || "").localeCompare(b.name || "", "pt")
        );

      usuarios.push(...dados);

      console.log(`✅ POP sincronizado`);
      console.log(`👥 Usuários encontrados: ${dados.length}`);

    } catch (erro) {
      console.log(`❌ Falha ao sincronizar POP: ${mikrotik.nome}`);

      if (erro.response) {
        console.log("📄 Status:", erro.response.status);
        console.log("📄 Resposta:", erro.response.data);
      } else {
        console.log("📄 Erro:", erro.message);
      }
    }
  }

  console.log("\n========================================");
  console.log(`📊 TOTAL DE USUÁRIOS: ${usuarios.length}`);
  console.log("========================================");

  return usuarios;
}

// ========================================
// 🔄 Atualizar usuário no MikroTik correto
// ========================================
export async function atualizarMikrotik(req, res) {
  const { id } = req.params;

  let usuario = null;

  try {
    const sql =
      "SELECT * FROM tabelausuarios WHERE idUsuario = ?";

    usuario = (await consulta(sql, [id]))[0];

    if (!usuario) {
      return res.status(404).json({
        msg: "Usuário não encontrado",
      });
    }

    const mikrotik = mikrotiks.find(
      (m) => m.nome === usuario.pop
    );

    if (!mikrotik) {
      return res.status(404).json({
        msg: "POP não encontrado",
      });
    }

    console.log("\n========================================");
    console.log("🔄 Atualizando usuário");
    console.log("👤 Nome:", usuario.name);
    console.log("🆔 ID:", usuario.idUsuario);
    console.log("📡 POP:", usuario.pop);
    console.log("========================================");

    const response = await axios.put(
      `${mikrotik.url}/${usuario.id}`,
      {
        disabled: usuario.disabled,
        name: usuario.name,
        password: usuario.password,
        profile: usuario.profile,
        service: usuario.service,
      },
      {
        auth: {
          username: mikrotik.user,
          password: mikrotik.pass,
        },
      }
    );

    console.log(
      `✅ Usuário ${usuario.name} atualizado com sucesso`
    );

    return res.json(response.data);

  } catch (erro) {
    console.log("\n========================================");
    console.log("❌ ERRO AO ATUALIZAR USUÁRIO");

    if (usuario) {
      console.log("👤 Nome:", usuario.name);
      console.log("🆔 ID:", usuario.idUsuario);
      console.log("📡 POP:", usuario.pop);
    }

    if (erro.response) {
      console.log("📄 Status:", erro.response.status);
      console.log("📄 Resposta:", erro.response.data);
    } else {
      console.log("📄 Erro:", erro.message);
    }

    console.log("========================================");

    return res.status(500).json({
      erro: "Erro ao atualizar MikroTik",
    });
  }
}