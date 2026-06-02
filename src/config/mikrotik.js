import dotenv from "dotenv"

dotenv.config()

const mikrotiks = [
  // {
  //   nome: "office-beira",
  //   url: "http://102.67.188.90:8070/rest/ppp/secret",
  //   active: "http://102.67.188.90:8070/rest/ppp/active",
  //   user: process.env.USER,
  //   pass: process.env.PASSWORD
  // },
  {
    nome: "malhangalene",
    url: "http://102.67.189.1:8070/rest/ppp/secret",
    active: "http://102.67.189.1:8070/rest/ppp/active",
    user: process.env.USER,
    pass: process.env.PASSWORD
  },
  {
    nome: "capuchinho",
    url: "http://102.67.189.5:8070/rest/ppp/secret",
    active: "http://102.67.189.5:8070/rest/ppp/active",
    user: process.env.USER,
    pass: process.env.PASSWORD
  },
  // {
  //   nome: "teledata",
  //   url: "http://102.67.188.253:7070/rest/ppp/secret",
  //   active: "http://102.67.188.253:7070/rest/ppp/active",
  //   user: process.env.USER,
  //   pass: process.env.PASSWORD
  // },
  // {
  //   nome: "sixtv",
  //   url: "http://196.250.235.38:1024/rest/ppp/secret",
  //   active: "http://196.250.235.38:1024/rest/ppp/active",
  //   user: process.env.USER,
  //   pass: process.env.PASSWORD
  // }
];

export default mikrotiks; 