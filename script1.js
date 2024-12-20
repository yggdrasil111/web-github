function calculateTable() {
    const operation = document.getElementById('operation').value;
    const expression = document.getElementById('expression').value;
    const variables = Array.from(new Set(expression.match(/[a-z]/g))).sort();
    const truthTable = document.getElementById('truthTable');
    const steps = document.getElementById('steps');
    const resultDiv = document.getElementById('result');
    truthTable.innerHTML = '';
    resultDiv.textContent = ''; // Reset hasil

    // Header Table
    const headerRow = document.createElement('tr');
    variables.forEach(variable => {
        const th = document.createElement('th');
        th.textContent = variable;
        headerRow.appendChild(th);
    });
    const resultHeader = document.createElement('th');
    resultHeader.textContent = expression;
    headerRow.appendChild(resultHeader);
    truthTable.appendChild(headerRow);

    // Rows Table
    const numRows = Math.pow(2, variables.length);
    let explanation = "<ul>";
    let allTrue = true;
    let hasTrue = false;

    for (let i = 0; i < numRows; i++) {
        const row = document.createElement('tr');
        const values = i.toString(2).padStart(variables.length, '0').split('').map(v => v === '1');
        const env = {};
        variables.forEach((variable, index) => {
            env[variable] = values[index];
            const td = document.createElement('td');
            td.textContent = env[variable] ? "Benar" : "Salah";
            row.appendChild(td);
        });

        // Replace and Evaluate Expression
        let exprEval = expression;
        for (const [variable, value] of Object.entries(env)) {
            exprEval = exprEval.replace(new RegExp(variable, 'g'), value);
        }

        // Tambahkan logika untuk implikasi (→) dan biimplikasi (↔)
        exprEval = exprEval
            .replace(/∧/g, '&&') // Konjungsi
            .replace(/∨/g, '||') // Disjungsi
            .replace(/¬/g, '!')  // Negasi
            .replace(/→/g, '=>') // Implikasi (custom)
            .replace(/↔/g, '==='); // Biimplikasi (custom)

        // Definisikan implikasi dan biimplikasi secara manual
        exprEval = exprEval.replace(/=>/g, (match, offset, str) => {
            const left = str.slice(0, offset).trimEnd();
            const right = str.slice(offset + 2).trimStart();
            return `!(${left}) || (${right})`;
        });

        const result = eval(exprEval); // Evaluasi ekspresi

        const resultTd = document.createElement('td');
        resultTd.textContent = result ? "Benar" : "Salah";
        row.appendChild(resultTd);
        truthTable.appendChild(row);

        explanation += `<li>Baris ${i+1}: Substitusi variabel ${JSON.stringify(env)} menghasilkan ${result ? "Benar" : "Salah"}</li>`;

        // Logika Tautologi, Konjungsi, Diskonjungsi
        if (!result) allTrue = false; // Jika ada salah, bukan tautologi
        if (result) hasTrue = true;   // Jika ada benar, bisa jadi diskonjungsi
    }
    explanation += "</ul>";
    document.getElementById('processExplanation').innerHTML = explanation;

    // Cek Operasi yang Dipilih
    if (operation === "tautologi") {
        resultDiv.textContent = allTrue ? "Ekspresi ini adalah Tautologi." : "Ekspresi ini bukan Tautologi.";
    } else if (operation === "kontigensi") {
        resultDiv.textContent = !allTrue && hasTrue ? "Ekspresi ini adalah Kontigensi." : "Ekspresi ini bukan Kontigensi.";
    } else if (operation === "kontradiksi") {
        resultDiv.textContent = !hasTrue ? "Ekspresi ini adalah Kontradiksi." : "Ekspresi ini bukan Kontradiksi.";
    }
}
