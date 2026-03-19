// import jwt from "jsonwebtoken";
// import axios from "axios";
// import consulta from "../database/conexao.js";
// import dontenv from "dotenv";
// import schedule from "node-schedule";

// dontenv.config();
// const MIKROTIK = process.env.MIKROTIK;

// export async function updateUsuario(req, res) {
//   const { id } = req.params;
//   const {
//     disabled,
//     name,
//     password,
//     precousuario,
//     profileusuario,
//     profile,
//     service,
//     token,
//   } = req.body;
//   try {
//     const sql1 = "SELECT *FROM tabelausuarios WHERE idUsuario=?";
//     const usuario1 = await consulta(sql1, [id]);
//     if (usuario1[0]) {
//       const camposAtualizar = {};
//       if (disabled !== undefined) camposAtualizar.disabled = disabled;
//       if (name !== undefined) camposAtualizar.name = name;
//       if (password !== undefined) camposAtualizar.password = password;
//       if (precousuario !== undefined)
//         camposAtualizar.precousuario = precousuario;
//       if (profileusuario !== undefined)
//         camposAtualizar.profileusuario = profileusuario;
//       if (profile !== undefined) camposAtualizar.profile = profile;
//       if (service !== undefined) camposAtualizar.service = service;
//       if (token !== undefined) camposAtualizar.token = token;

//       const sql = "UPDATE tabelausuarios SET ? WHERE idUsuario = ?";
//       const usuarioAtualizado = await consulta(sql, [camposAtualizar, id]);
//       return res.status(200).json(usuarioAtualizado);
//     } else {
//       return res.status(404).json({ Mensagem: "usuario nao Encontrado!" });
//     }
//   } catch (erro) {
//     console.log(erro);
//   }
// }
// export async function deleteUsuario(req, res) {
//   const { id } = req.params;

//   try {
//     const sql1 = "SELECT *FROM tabelausuarios WHERE idUsuario = ?";
//     const sql = " DELETE FROM tabelausuarios WHERE idUsuario = ?";
//     const usuario1 = await consulta(sql1, [id]);
//     if (usuario1[0]) {
//       const usuario = await consulta(sql, [id]);
//       return res.status(200).json(usuario);
//     } else {
//       return res.status(404).json({ Mensagem: "Usuario nao encontrado!" });
//     }
//   } catch (erro) {
//     console.log(erro);
//   }
// }

// export async function buscarDadosDoMikrotik(req, res) {
//   try {
//     const dados = await axios.get(MIKROTIK, {
//       auth: {
//         username: process.env.USER,
//         password: process.env.PASSWORD,
//       },
//     });
//     return dados.data;
//   } catch (erro) {
//     return res.json({ Mensagem: erro });
//   }
// }

// export async function inserirDadosNoMikrotik(data, req, res) {
//   const sql1 =
//     "SELECT COUNT(*) AS count FROM tabelausuarios WHERE id = ? OR name = ?";
//   const sql =
//     "INSERT INTO tabelausuarios (id, disabled, name, password, profile, service) VALUES (?, ?, ?, ?, ?, ?)";
//   try {
//     for (const item of data) {
//       const [verificacao] = await consulta(sql1, [item[".id"], item.name]);
//       if (verificacao.count > 0) {
//         continue;
//       } else {
//         const usuarios = await consulta(sql, [
//           item[".id"],
//           item.disabled,
//           item.name,
//           item.password,
//           item.profile,
//           item.service,
//         ]);
//       }
//     }
//     return res.json({ Mensagem: "BackUp Feito!" });
//   } catch (erro) {
//     console.log(erro);
//   }
// }

// export async function main(req, res) {
//   try {
//     const data = await buscarDadosDoMikrotik(req, res);
//     await inserirDadosNoMikrotik(data, req, res);
//   } catch (erro) {
//     console.log(erro);
//     return res.status(500).json({ Mensagem: erro.message });
//   }
// }

// export async function updateMikrotik(req, res) {
//   const { id } = req.params;
//   try {
//     const sql = "SELECT *FROM tabelausuarios WHERE idUsuario = ?";
//     const respostaUsuario = await consulta(sql, [id]);
//     const usuario = respostaUsuario[0];
//     const idMikrotik = usuario.id;
//     const name = usuario.name;
//     const password = usuario.password;
//     const service = usuario.service;
//     const disabled = usuario.disabled;
//     const profile = usuario.profile;
//     if (usuario) {
//       const user = await axios.put(
//         process.env.MIKROTIK + "/" + idMikrotik,
//         {
//           disabled: disabled,
//           name: name,
//           password: password,
//           profile: profile,
//           service: service,
//         },
//         {
//           auth: {
//             username: process.env.USER,
//             password: process.env.PASSWORD,
//           },
//         }
//       );
//       return res.json(user.data);
//     }
//   } catch (erro) {
//     console.log(erro);
//   }
// }

// export async function verificarParaBackUp() {
// try {
// const dblocal = "SELECT * FROM tabelausuarios"; // Corrigido o espaço após SELECT *
// const usuariosdbLocal = await consulta(dblocal);
// const dadosMikrotik = await axios.get(process.env.MIKROTIK, {
// auth: {
// username: process.env.USER,
// password: process.env.PASSWORD,
// },
// });
// const dadosFiltrados = usuariosdbLocal.filter((user) => user.tipoUsuario !== "admin" && user.tipoUsuario !== "super")
// const idsMikrotik = dadosMikrotik.data.map((item) => item[".id"]);
// if (dadosMikrotik.data.length > dadosFiltrados.length) {
// //const backup = await axios.get(process.env.LOCAL + "/backup");
//     await main()
// } else if (dadosFiltrados.length > dadosMikrotik.data.length) {
// // Apenas usuários que não estão no Mikrotik E não são administradores
// const usuariosParaApagar = usuariosdbLocal.filter(
// (usuario) =>
// !idsMikrotik.includes(usuario.id) &&
// usuario.tipousuario !== "admin" && 
// usuario.tipousuario !== "super"  // Protege admins contra exclusão
// );
// for (const usuario of usuariosParaApagar) {
// const sql = "DELETE FROM tabelausuarios WHERE id = ?";
// const dadoApagar = await consulta(sql, [usuario.id]);
// }
// console.log("BackUp feito com sucesso!");
// }
// } catch (erro) {
// console.log(erro);
// // return res.json(erro);
// }
// }
// export async function rastrearUsuarioNovo(req, res) {
//   try {
//     // Consulta todos os usuários no banco de dados local
//     const dblocal = "SELECT * FROM tabelausuarios";
//     const usuariosdbLocal = await consulta(dblocal);

//     // Consulta todos os usuários no MikroTik
//     const dadosMikrotik = await axios.get(process.env.MIKROTIK, {
//       auth: {
//         username: process.env.USER,
//         password: process.env.PASSWORD,
//       },
//     });

//     // Extrai apenas os IDs dos usuários no MikroTik
//     const idsMikrotik = dadosMikrotik.data.map((item) => item[".id"]);

//     // Se houver mais usuários no MikroTik do que no banco de dados local
//     if (dadosMikrotik.data.length > usuariosdbLocal.length) {
//       // Filtra para encontrar os usuários que foram adicionados recentemente no MikroTik
//       const novosUsuarios = dadosMikrotik.data.filter(
//         (usuario) =>
//           !usuariosdbLocal.some((localUser) => localUser.id === usuario[".id"])
//       );

//       // Se encontrar novos usuários, retorna seus dados
//       if (novosUsuarios.length > 0) {
//         // Cria uma lista com os nomes dos novos usuários
//         const nomesNovosUsuarios = novosUsuarios
//           .map((usuario) => usuario.name)
//           .join(", ");
//         return res.json({
//           mensagem: "Novos usuários encontrados: " + nomesNovosUsuarios,
//         });
//       } else {
//         // Caso contrário, retorna uma mensagem indicando que não há novos usuários
//         return res.json({ mensagem: "Não houve novos usuários ainda!" });
//       }
//     } else {
//       // Se não houver mais usuários no MikroTik, indica que não há novos usuários
//       return res.json({ mensagem: "Não houve novos usuários ainda!" });
//     }
//   } catch (erro) {
//     console.log(erro);
//     // Em caso de erro, retorna uma mensagem de erro
//     return res.json({ erro: "Ocorreu um erro ao rastrear usuários." });
//   }
// }

// export async function atualizarDadosMikrotikDbLocal(id) {
//   try {
//     const sqlUsuario = "SELECT * FROM tabelausuarios WHERE idUsuario = ?";
//     const usuarioDb = (await consulta(sqlUsuario, [id]))[0];

//     if (usuarioDb) {
//       try {
//         const usuario = await axios.put(
//           process.env.MIKROTIK + "/" + usuarioDb.id,
//           {
//             disabled: usuarioDb.disabled,
//             name: usuarioDb.name,
//             password: usuarioDb.password,
//             profile: usuarioDb.profile,
//             service: usuarioDb.service,
//           },
//           {
//             auth: {
//               username: process.env.USER,
//               password: process.env.PASSWORD,
//             },
//           }
//         );
//         return res
//           .status(200)
//           .json({ Mensagem: "Plano do Mikrotik atualizado com Sucesso!" });
//       } catch (erro) {
//         console.log(erro);
//       }
//     } else {
//       console.log("Usuario Nao Encontrado!");
//     }
//   } catch (erro) {
//     console.log(erro);
//   }
// }

// export async function verificarToken(id) {
//   try {
//     const sqlUsuario = "SELECT *FROM tabelausuarios WHERE idUsuario = ?";
//     const usuarioDb = (await consulta(sqlUsuario, [id]))[0];

//     if (!usuarioDb) {
//       //return res.status(404).json({ mensagem: "Usuário não encontrado" });
//     }

//     jwt.verify(usuarioDb.token, process.env.CHAVESECRETA, async (erro) => {
//       if (erro) {
//         try {
//           await axios.put(
//             `${process.env.MIKROTIK}/${usuarioDb.id}`,
//             {
//               disabled: "true",
//               name: usuarioDb.name,
//               password: usuarioDb.password,
//               profile: "DESATVADO", // Atualize o perfil
//               service: usuarioDb.service,
//             },
//             {
//               auth: {
//                 username: process.env.USER,
//                 password: process.env.PASSWORD,
//               },
//               timeout: 20000,
//             }
//           );

//           await axios.put(
//             `${process.env.URL}/usuario/${id}`,
//             {
//               disabled: "true",
//               profile: "DESATVADO",
//             },
//             {
//               timeout: 20000,
//             }
//           );

//           const active = await axios.get(process.env.ACTIVE,
//             {
//               auth: {
//                 username: process.env.USER,
//                 password: process.env.PASSWORD,
//               },
//               timeout: 20000,
//             }
//           )

//           const secret = await axios.get(
//             `${process.env.MIKROTIK}/${usuarioDb.id}`,
//             {
//               auth: {
//                 username: process.env.USER,
//                 password: process.env.PASSWORD,
//               },
//               timeout: 20000,
//             }
//           );

//           for (let item of active.data) {
//             if (item.name === secret.data.name) {
//               const disabled = await axios.delete(
//                 `${process.env.ACTIVE}/${item[".id"]}`,
//                 {
//                   auth: {
//                     username: process.env.USER,
//                     password: process.env.PASSWORD,
//                   },
//                   timeout: 20000,
//                 }
//               );
//               if (disabled) {
//                 console.log("USUARIO " + secret.data.name + " REMOVIDO DO ACTIVE CONECTION COM SECESSO!")
//                 console.log(" ")
//               }
//               break;
//             } else {
//               //console.log("Nao foi possivel encontrar o UserName");
//             }
//           }

//           console.log(" TOKEN EXPIRADO E USUARIO " + usuarioDb.name + " DESATIVADO");
//           //return res.status(200).json({ mensagem: "Usuário desativado com sucesso" });
//         } catch (erroAxios) {
//           console.error("Erro ao desativar Mikrotik ou atualizar banco para o usuario : " + usuarioDb.name, erroAxios.response?.data || erroAxios.message);
//           //return res.status(500).json({ mensagem: "Erro ao desativar Mikrotik ou atualizar banco" });
//         }
//       } else {
//         try {
//           await axios.put(
//             `${process.env.MIKROTIK}/${usuarioDb.id}`,
//             {
//               disabled: "false",
//               name: usuarioDb.name,
//               password: usuarioDb.password,
//               profile: usuarioDb.profile,
//               service: usuarioDb.service,
//             },
//             {
//               auth: {
//                 username: process.env.USER,
//                 password: process.env.PASSWORD,
//               },
//               timeout: 20000,
//             }
//           );

//           await axios.put(
//             `${process.env.URL}/usuario/${id}`,
//             {
//               disabled: "false",
//               profile: usuarioDb.profile,
//             },
//             {
//               timeout: 20000,
//             }
//           );
//           console.log("TOKEN VALIDO E USUARIO " + usuarioDb.name + " ACTIVADO ");
//           //return res.status(200).json({ mensagem: "Usuário ativado com sucesso" });
//         } catch (erroAxios) {
//           console.error("Erro ao ativar Mikrotik ou atualizar banco para o usuario : " + usuarioDb.name, erroAxios.response?.data || erroAxios.message);
//           //return res.status(500).json({ mensagem: "Erro ao ativar Mikrotik ou atualizar banco" });
//         }
//       }
//     });
//   } catch (erro) {
//     console.error("Erro ao verificar token: ", erro);
//     //return res.status(500).json({ mensagem: "Erro interno do servidor" });
//   }
// }

// let isJobRunning = false;
// //Função que será executada a cada 15 segundos
// const job = schedule.scheduleJob("*/180 * * * * *", async function () {
//   if (isJobRunning) {
//     console.log("O job anterior ainda está em execução, aguardando...");
//     return;
//   }

//   isJobRunning = true;

//   try {
//     await verificarParaBackUp();
//     const usuarios = await axios.get(process.env.URL + "/usuarios" )
//     const dadosFiltrados = usuarios.data.filter((user) => user.tipoUsuario !== "admin" && user.tipoUsuario !== "super" && user.tipoUsuario !== "colab")
//     const ids = dadosFiltrados.map((usuario) => usuario.idUsuario)
//     //const ids = [1, 11, 15, 35, 51, 100, 106]; // ← IDs dos usuários a serem verificados

//     for (const id of ids) {
//       await verificarToken(id);
//     }

//   } catch (erro) {
//     console.error("Erro durante a execução do job:", erro);
//   } finally {
//     isJobRunning = false;
//   }
// });
