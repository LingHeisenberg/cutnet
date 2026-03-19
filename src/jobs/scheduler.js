import cron from "node-cron";
import { buscarUsuariosMikrotik } from "../services/mikrotik.service.js";
import { backupUsuarios, sincronizarRemocoes } from "../services/backup.service.js";
import { verificarToken } from "../services/token.service.js";
import consulta from "../database/conexao.js";

let rodando = false;

export function iniciarCron() {

  cron.schedule("*/3 * * * *", async () => {

    if (rodando) {
      console.log("⏳ Já está rodando...");
      return;
    }

    rodando = true;

    console.log("🚀 Iniciando job...");

    try {

      // 🔹 1. Buscar usuários dos Mikrotiks
      const usuarios = await buscarUsuariosMikrotik();
      console.log(`📡 ${usuarios.length} usuários encontrados`);

      // 🔹 2. Fazer backup no banco
      await backupUsuarios(usuarios);
      console.log("💾 Backup concluído");
      await sincronizarRemocoes(usuarios)
      if(sincronizarRemocoes){
        console.log("Sincronizacao Com remocao feita com Sucesso!")
      }else{
        console.log("Falha ao remover!")
      }
      // 🔹 3. Verificar tokens (OTIMIZADO)
      // const usuariosDb = await consulta("SELECT idUsuario FROM tabelausuarios");

      // console.log(`🔍 Verificando ${usuariosDb.length} usuários...`);

      // // await Promise.all(
      // //   usuariosDb.map(user => verificarToken(user.idUsuario))
      // // );

      // console.log("🔐 Verificação de tokens concluída");

    } catch (erro) {

      console.log("❌ Erro no cron:", erro.message);

    } finally {

      rodando = false;

      console.log("⏱️ Job finalizado");
    }

  });

}