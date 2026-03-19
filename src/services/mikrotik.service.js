import axios from "axios";
import mikrotiks from "../config/mikrotik.js";
import consulta from "../database/conexao.js";


// 🔄 Buscar usuários de todos POPs
export async function buscarUsuariosMikrotik() {

  const usuarios = [];

  for (const mikrotik of mikrotiks) {

    try {
      console.log("🔄 Conectando ao POP:", mikrotik.nome);
      console.log("URL:", mikrotik.url);
      const auth = Buffer.from(
        `${mikrotik.user}:${mikrotik.pass}`
      ).toString("base64");

      const response = await axios.get(mikrotik.url, {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Basic ${auth}`
        },
        timeout: 20000
      });

      const dados = response.data.map(user => ({
        ...user,
        pop: mikrotik.nome
      }));

      usuarios.push(...dados);

      console.log("✅ POP sincronizado:", mikrotik.nome);
      console.log("Usuarios encontrados:", dados.length);

    } catch (erro) {

      console.log("❌ Erro no POP:", mikrotik.nome);

      if (erro.response) {
        console.log("Status:", erro.response.status);
        console.log("Resposta:", erro.response.data);
      } else {
        console.log("Erro:", erro.message);
      }

    }

  }

  console.log("TOTAL USUÁRIOS:", usuarios.length);

  return usuarios;
}


// 🔄 Atualizar usuário no MikroTik correto (MULTI-POP)
export async function atualizarMikrotik(req, res) {

  const { id } = req.params;

  try {

    const sql = "SELECT * FROM tabelausuarios WHERE idUsuario=?";
    const usuario = (await consulta(sql, [id]))[0];

    if (!usuario) {
      return res.status(404).json({ msg: "Usuário não encontrado" });
    }

    const mikrotik = mikrotiks.find(m => m.nome === usuario.pop);

    if (!mikrotik) {
      return res.status(404).json({ msg: "POP não encontrado" });
    }

    const response = await axios.put(
      `${mikrotik.url}/${usuario.id}`,
      {
        disabled: usuario.disabled,
        name: usuario.name,
        password: usuario.password,
        profile: usuario.profile,
        service: usuario.service
      },
      {
        auth: {
          username: mikrotik.user,
          password: mikrotik.pass
        }
      }
    );

    return res.json(response.data);

  } catch (erro) {

    console.log(erro);
    return res.status(500).json({ erro: "Erro ao atualizar MikroTik" });

  }
}