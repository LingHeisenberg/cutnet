import e from "express"
import dotenv from "dotenv"
import cors from "cors"
import router from "./src/routes/router.js"

dotenv.config()

const app = e()
app.use(cors())
app.use(e.json())
app.use(router)

const porta = process.env.PORT || 8002

app.listen(porta, () => {
    console.log("Servidor no ar na porta " + porta)
})
