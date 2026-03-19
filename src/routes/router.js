import e from "express";

import { buscarUsuariosMikrotik } from "../services/mikrotik.service.js";
import { backupUsuarios } from "../services/backup.service.js";
import { atualizarMikrotik } from "../services/mikrotik.service.js";

// import {
//   updateUsuario
// } from "../services/usuario.service.js";

import { verificarToken } from "../services/token.service.js";

const router = e.Router();


// 🔄 Buscar todos usuários de todos POPs
router.get("/mikrotiks", async (req, res) => {
  const dados = await buscarUsuariosMikrotik();
  res.json(dados);
});


// 💾 Backup manual (todos POPs)
// router.get("/backup", async (req, res) => {
//   const dados = await buscarUsuariosMikrotik();
//   await backupUsuarios(dados);
//   res.json({ mensagem: "Backup feito com sucesso" });
// });


// 🔄 Atualizar usuário no MikroTik correto
router.put("/mikrotik/:id", atualizarMikrotik);


// 👤 Atualizar usuário no banco
//router.put("/usuario/:id", updateUsuario);


// 🔍 Manter funcionalidades antigas
//router.get("/rastrear", rastrearUsuarioNovo);


// 🔑 Verificar token
router.get("/verificarToken/:id", async (req, res) => {
  await verificarToken(req.params.id);
  res.json({ mensagem: "Verificação concluída" });
});


export default router;