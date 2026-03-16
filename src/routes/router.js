import e from "express";
import { atualizarDadosMikrotikDbLocal, buscarDadosDoMikrotik, main, rastrearUsuarioNovo, updateMikrotik, updateUsuario, verificarParaBackUp, verificarToken } from "../services/usuario.service.js";

const router = e.Router()

//ROTAS DE MIKROTIK

router.get("/backup", main)
router.get("/atualizar/:id", updateMikrotik)
router.get("/verificar", verificarParaBackUp)
router.get("/motrarDadosMikrotik", buscarDadosDoMikrotik)
router.get("/rastrear", rastrearUsuarioNovo)
router.put("/usuario/:id", updateUsuario)

router.put("/atualizarMikrotik/:id", atualizarDadosMikrotikDbLocal)

export default router;
