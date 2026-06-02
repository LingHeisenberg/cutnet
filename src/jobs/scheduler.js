import cron from "node-cron";
import { buscarUsuariosMikrotik } from "../services/mikrotik.service.js";
import { backupUsuarios } from "../services/backup.service.js";

import { sincronizarRemocoes } from "../services/backup.service.js";
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

    console.log("🚀 Iniciando backup...");

    try {
      // 🔹 Buscar usuários dos Mikrotiks
      const usuarios = await buscarUsuariosMikrotik();
      console.log(`📡 ${usuarios.length} usuários encontrados`);

      // 🔹 Fazer backup no banco
      await backupUsuarios(usuarios);
      console.log("💾 Backup concluído");

      // ===== FUNCIONALIDADES DE CORTE DESATIVADAS =====

      await sincronizarRemocoes(usuarios);

      const usuariosDb = await consulta(
        "SELECT idUsuario FROM tabelausuarios"
      );

      await Promise.all(
        usuariosDb.map((user) => verificarToken(user.idUsuario))
      );

      // ==============================================

    } catch (erro) {
      console.error("❌ Erro no backup:", erro.message);
    } finally {
      rodando = false;
      console.log("⏱️ Job finalizado");
    }
  });

  console.log("📅 Cron iniciado (somente backup)");
}