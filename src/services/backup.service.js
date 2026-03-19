import consulta from "../database/conexao.js";

export async function backupUsuarios(usuarios){

  const sqlCheck =
  "SELECT COUNT(*) as total FROM tabelausuarios WHERE id=?";

  const sqlInsert =
  `INSERT INTO tabelausuarios
  (id,name,password,profile,service,disabled,pop)
  VALUES(?,?,?,?,?,?,?)`;

  for(const user of usuarios){

    const [verifica] =
    await consulta(sqlCheck,[user[".id"]]);

    if(verifica.total > 0) continue;

    await consulta(sqlInsert,[
      user[".id"],
      user.name,
      user.password,
      user.profile,
      user.service,
      user.disabled,
      user.pop
    ]);

  }

  console.log("Backup realizado");

}

export async function sincronizarRemocoes(usuariosMikrotik) {
  try {

    // 🔹 IDs vindos do Mikrotik
    const idsMikrotik = usuariosMikrotik.map(u => u[".id"] + "_" + u.pop);

    // 🔹 Buscar todos do banco
    const usuariosDb = await consulta(
      "SELECT idUsuario, id, pop FROM tabelausuarios WHERE removido='false'"
    );

    for (const user of usuariosDb) {

      const idComposto = user.id + "_" + user.pop;

      // ❌ Não existe mais no Mikrotik
      if (!idsMikrotik.includes(idComposto)) {

        await consulta(
          "UPDATE tabelausuarios SET removido='true' WHERE idUsuario=?",
          [user.idUsuario]
        );

        console.log("🗑️ Removido do Mikrotik:", user.idUsuario);
      }

    }

  } catch (erro) {
    console.log("Erro ao sincronizar remoções:", erro.message);
  }
}