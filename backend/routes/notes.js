const express = require('express');
const router = express.Router()
const fetchuser = require('../middleware/fetchuser');
const Note = require('../models/Note');
const { body, validationResult } = require('express-validator');

// get all notes details using GET "/api/notes/fetchallnotes". Login required
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id });
        res.json(notes)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
    
})

// Add a new note using Post "/api/notes/addnote". Login required
router.post('/addnote', fetchuser, [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', 'Description should alteast 5 character ').isLength({ min: 5 }),], async (req, res) => {
        try {

            const { title, description, tag } = req.body;
            // if there are errors then return bad request and the errors
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const note = new Note({
                title, description, tag, user: req.user.id
            })
            const savedNote = await note.save()
            res.json(savedNote)
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal Server Error");
        }
    })

// updating an existing note using PUT "api/notes/updatenote". Login required
router.put('/updatenote/:id', fetchuser, async (req, res) => {
        const {title, description, tag} = req.body;
        try {
        // create a new note object
        const newNote =  {};
        if(title){newNote.title = title};
        if(description){newNote.description = description};
        if(tag){newNote.tag = tag};

        // find the note to be updated and update it
        let note = await Note.findById(req.params.id);
        if(!note){
            return res.status(404).send("Not found")
        }
        // allow user to update note if user own this note
        if(note.user.toString() !== req.user.id){
            return res.status(401).send("Not allowed")
        }

        note = await Note.findByIdAndUpdate(req.params.id, {$set: newNote}, {new:true})
        res.json({note});
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
    })



    // Delete an existing note using DELETE "api/notes/deletenote". Login required
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    const {title, description, tag} = req.body;
    try {
    // create a new note object
    const newNote =  {};
    if(title){newNote.title = title};
    if(description){newNote.description = description};
    if(tag){newNote.tag = tag};

    // find the delete to be deleted and update it
    let note = await Note.findById(req.params.id);
    if(!note){
        return res.status(404).send("Not found")
    }
    // allow user to delete note if user own this note
    if(note.user.toString() !== req.user.id){
        return res.status(401).send("Not allowed")
    }

    note = await Note.findByIdAndDelete(req.params.id)
    res.json({"Success": "Note has been deleted", note: note});
} catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
}
})

module.exports = router