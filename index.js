import { error } from "console";
import express from "express";
import fs from "fs/promises";


const app = express();
const PORT = 8000;

// ---1---
app.get('/health', async (req, res) => {
    res.json({
        satatus: "OK",
        serverTime: "ISO_TIMESTAMP"
    })
})

// ---2---
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

// ---3---
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

// ---4---
app.get('/targets', async (req, res) => {
    try {
        const data = await fs.readFile('targets.json', 'utf-8');
        let targets = JSON.parse(data);

        // destructuring assignment
        const { region, status, minPriority } = req.query;

        if (region) {
            targets = targets.filter(t => t.region === region);
        }

        if (status) {
            targets = targets.filter(t => t.status === status);
        }

        if (minPriority) {
            const priorityNum = parseInt(minPriority);
            if (!isNaN(priorityNum)) {
                targets = targets.filter(t => t.priority >= priorityNum);
            }
        }

        res.status(200).json({
            success: true,
            count: targets.length,
            data: targets
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            msg: "Error reading targets data"
        });
    }
});

// extra 1
app.get('/targets/:id/brief', async (req, res) => {
    const { id } = req.params;
    const data = await fs.readFile('targets.json', 'utf-8');
    const targets = JSON.parse(data);
    
    const target = targets.find(t => t.id === parseInt(id));

    if (!target) {
        return res.status(404).json({ success: false, msg: "target not found" });
    }

    const briefData = {
        name: target.name,
        status: target.status
    };

    res.status(200).json({ success: true, data: briefData });
});

// extra 2
app.get('/intel/ping', (req, res) => {
    const unitId = req.headers['unit-id'];
    const { level } = req.query;

    if (!unitId) {
        return res.status(401).json({ msg: "missing unit-id header" });
    }

    if (level === 'high') {
        return res.status(200).json({ 
            msg: "Pong", 
            detail: "All systems operational", 
            unit: unitId 
        });
    }

    res.status(200).json({ msg: "Pong" });
});
// header: key: unit-id - value: 8200
// localhost:8000/intel/ping?level=high

// extra 3
app.get('/targets/search', async (req, res) => {
    const { q } = req.query;
    
    if (!q) return res.status(400).json({ msg: "Search not found" });

    const data = await fs.readFile('targets.json', 'utf-8');
    const targets = JSON.parse(data);

    // check if part includes 
    const filtered = targets.filter(t => 
        t.name.toLowerCase().includes(q.toLowerCase())
    );

    res.status(200).json({ success: true, results: filtered });
});
// localhost:8000/targets/search?q=north
// header: unit-id: 8200


app.listen(PORT, () => {
    console.log(`server is run on http://localhost${PORT}`)
})