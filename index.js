import { error } from "console";
import express from "express";
import fs from "fs/promises";

const app = express();
const PORT = 8000;


app.get('/health', async (req, res) => {
    res.json({
        satatus: "OK",
        serverTime: "ISO_TIMESTAMP"
    })
})

app.get('/briefing', (req, res) => {
    const headers = req.headers
    console.log(headers)
    if (headers["client-unit"] !== "Golani") {
        return res.status(400).json({
            success: false,
            msg: "briefing Not delivered"
        });
    } else {
        return res.status(200).json({
            success: true,
            msg: "briefing delivered"
        })
    }
});


app.get('/targets/:id', async (req, res) => {
    const {id } = req.params;
    const intId = parseInt(id);
    if (isNaN(intId)) throw new error("invalid id, please enter integer");
    const targets = await fs.readFile('targets', 'utf-8')
    const targetId = targets.find((t) => t.id === intId)
    if (!targetId) {
        res.status(404).json({ success: false, data: {} })
    } else {
        res.status(200).json({ success: true, data: targetId });
    }
})


app.get("/targets", async (req, res) => {
  try {
    const { completed } = req.query;

    const todosArr = await readTodos(TODOS_PATH);
    let filterdArr = todosArr;
    if (completed !== undefined) {
      filterdArr = todosArr.filter((todo) => String(todo.completed) === completed);
    }
    res.status(200).json({ msg: "success", data: filterdArr });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "error" + err.message, data: null });
  }
});

app.listen(PORT, () => {
    console.log(`server is run on http://localhost${PORT}`)
})