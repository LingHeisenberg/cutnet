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
    nome: "office-maputo",
    url: "http://102.67.188.169:8070/rest/ppp/secret",
    active: "http://102.67.188.169:8070/rest/ppp/active",
    user: process.env.USER,
    pass: process.env.PASSWORD
  },
  {
    nome: "kobe",
    url: "http://102.67.188.14/rest/ppp/secret",
    active: "http://102.67.188.14/rest/ppp/active",
    user: process.env.USER,
    pass: process.env.PASSWORD
  },
  {
    nome: "teledata",
    url: "http://102.67.188.253:7070/rest/ppp/secret",
    active: "http://102.67.188.253:7070/rest/ppp/active",
    user: process.env.USER,
    pass: process.env.PASSWORD
  },
  {
    nome: "sixtv",
    url: "http://196.250.235.38:1024/rest/ppp/secret",
    active: "http://196.250.235.38:1024/rest/ppp/active",
    user: process.env.USER,
    pass: process.env.PASSWORD
  }
  
];

export default mikrotiks; 