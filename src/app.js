import express from "express"
import cors from "cors"
import { MongoClient, ObjectId } from "mongodb"
import dotenv from "dotenv"

// Criação do App Servidor
const app = express()

// Configurações
app.use(cors())
app.use(express.json())
dotenv.config()

// Conexão com o banco de dados
const mongoClient = new MongoClient(process.env.DATABASE_URL)
try {
    await mongoClient.connect()
    console.log("MongoDB conectado!")
} catch (err) {
    console.log(err.message)
}
const db = mongoClient.db()

// Endpoints
app.get("/receitas", async (req, res) => {
    try {
        const receitas = await db.collection("receitas").find().toArray()
        res.send(receitas)
    } catch (err) {
        res.status(500).send(err.message)
    }
})

app.get("/receitas/:id", async (req, res) => {
    const { id } = req.params

    try {
        const receita = await db.collection("receitas").findOne({ _id: new ObjectId(id) })
        if (!receita) return res.status(404).send("Receita não existe")
        res.send(receita)
    } catch (err) {
        res.status(500).send(err.message)
    }
})

app.post("/receitas", async (req, res) => {
    const { titulo, ingredientes, preparo } = req.body

    if (!titulo || !ingredientes || !preparo) return res.sendStatus(422)

    const novaReceita = { titulo, ingredientes, preparo }

    try {
        const recipe = await db.collection("receitas").findOne({ titulo })
        if (recipe) return res.status(409).send("Essa receita já existe!")

        await db.collection("receitas").insertOne(novaReceita)
        res.sendStatus(201)
    } catch (err) {
        res.status(500).send(err.message)
    }
})


// Deixa o app escutando, à espera de requisições
const PORT = 5000
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`))