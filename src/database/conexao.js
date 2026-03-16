import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Função para criar e configurar o pool de conexões
const pool = mysql.createPool({
    uri: process.env.MYSQL_URL,
    waitForConnections: true,
    connectionLimit: 10, // Número máximo de conexões simultâneas
    queueLimit: 0, // Sem limite na fila
});

// Função para fazer as tentativas de conexão com limites
async function realizarConsultaComRetry(sql, dados = [], tentativas = 3, delay = 2000) {
    let tentativa = 0;
    let resultado;

    while (tentativa < tentativas) {
        try {
            // Obtém uma conexão do pool
            const connection = await pool.getConnection();
            
            try {
                // Executa a consulta
                const [rows] = await connection.execute(sql, dados);
                resultado = rows;  // Armazena o resultado
                connection.release(); // Libera a conexão
                break;  // Se a consulta for bem-sucedida, sai do loop
            } catch (erro) {
                // Se a consulta falhar, libere a conexão e tente novamente
                connection.release();
                throw erro;
            }
        } catch (erro) {
            tentativa++;
            console.error(`Erro na tentativa ${tentativa} ao executar consulta: ${erro.message}`);
            
            if (tentativa < tentativas) {
                // Espera antes de tentar novamente
                console.log(`Tentando novamente em ${delay / 1000} segundos...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                // Após atingir o limite de tentativas, lança o erro
                console.error("Número máximo de tentativas atingido. Erro persistente.");
                throw erro;
            }
        }
    }

    return resultado;
}

// Função para consultas ao banco de dados, utilizando a estratégia de retry
export default async function consulta(sql, dados = []) {
    try {
        const resultado = await realizarConsultaComRetry(sql, dados);
        return resultado;
    } catch (erro) {
        console.error("Erro ao executar consulta com retry:", erro.message);
        throw erro;
    }
}
