import express from "express";
const router = express.Router();
import multer from "multer";
import { v4 as uuidv4 } from 'uuid';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/')
    },
    filename: function (req, file, cb) {
        const ext = file.originalname.split('.')
            .filter(Boolean) // removes empty extensions (e.g. `filename...txt`)
            .slice(1)
            .join('.')
        cb(null, `${uuidv4()}.${ext}`)
    }
})

const upload = multer({ storage: storage });
router.post('/', upload.single("file"), (req, res) => {
    res.status(200).send({ url: `/${req.file?.path}` })
});

export = router;