import React, { useState, useContext } from 'react'
import { useParams } from 'react-router'

import Navbar from "../../menu_components/Navbar";
import app from "../../../base";
import { AuthContext } from "../../../auth";

const request = require("request-promise");

const MathJax = require('react-mathjax')

const Preview = () => {
    const { currentUser } = useContext(AuthContext);
    const { equation } = useParams();
    const [solution, setSolution] = useState([]);
    const send = equation.replace("%2F", "/");

    const addEquation = async (equation) => {
        const db = app.firestore();
        const uid = currentUser.uid;

        await db.collection('equations').doc().set({
            date: new Date().toString().split("GMT")[0],
            equation: equation,
            idUser: uid,
            pinned: false
        });
    }

    const handleSubmit = async () => {
        const options = {
            method: "POST",
            uri: `http://127.0.0.1:4000/solve`,
            body: { equation: send },
            json: true
        };

        await addEquation(send)
        const res = await request(options);
        if (res.status !== 'ok') {
            alert(res.status);
        } else {
            setSolution([
                { latex: res.solution, header: "Final Solution" }
            ]);
        }
    }

    const renderSolve = () => {
        if (solution.length !== 0) {
            var i = 1;
            return solution.map(step => (
                <div>
                    <br></br>
                    <h4>
                        Step {i}: {step.header}
                        {(() => { i++ })()}
                    </h4><br></br>
                    <MathJax.default.Provider>
                        <MathJax.default.Node inline formula={step.latex} />
                    </MathJax.default.Provider>
                </div>
            ))
        }
    }

    return (
        <div>
            <Navbar />
            <div className="jumbotron">
                <h1>Equation Preview</h1>
                <br></br>
                <h3>
                    <MathJax.default.Provider>
                        <MathJax.default.Node inline formula={send} />
                    </MathJax.default.Provider>
                </h3><br></br>
                <button onClick={handleSubmit} type="button" className="btn btn-primary">Solve</button><br></br>
                <br></br>
                <div id="solve">
                    {renderSolve()}
                </div>
            </div>
        </div>
    )
}

export default Preview;

