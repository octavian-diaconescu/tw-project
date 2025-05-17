/* alert(1)

a=10
alert(a)
alert(window.a) */
window.onload = function () {
    let produseInitiale = Array.from(document.getElementsByClassName("produs"));
    btn = document.getElementById("filtrare");
    multiple_select();
    btn.onclick = function () {
        let inpNume= document.getElementById("inp-nume").value.trim().toLowerCase()
        const txtArea= document.getElementById("inp-txtarea"); 
        const descFilterRaw= txtArea ? txtArea.value.trim().toLowerCase() : "";
        const isKeywordSearch= descFilterRaw.includes('+') || descFilterRaw.includes('-');

        const plusKeywords= [];
        const minusKeywords= [];
        if (isKeywordSearch) {
            descFilterRaw.split(/\s+/).forEach(w => {
            if (w.startsWith('+') && w.length > 1) plusKeywords.push(w.slice(1));
            else if (w.startsWith('-') && w.length > 1) minusKeywords.push(w.slice(1));
            });
        }

        if (!validateInputs()) {
            return;
        }
        
        let vectRadio = document.getElementsByName("gr_rad")

        let inpCalorii = null
        let minCalorii = null
        let maxCalorii = null
        for (let rad of vectRadio) {
            if (rad.checked) {
                inpCalorii = rad.value
                if (inpCalorii != "toate") {
                    [minCalorii, maxCalorii] = inpCalorii.split(":") //"350:700" -> ["350","700"]
                    minCalorii = parseInt(minCalorii) //"350" -> 350
                    maxCalorii = parseInt(maxCalorii)
                }
                break
            }
        }

        let inpPret = document.getElementById("inp-pret").value
        let inpSubCategorie = document.querySelector('input[name="subcategorie"]:checked').value.trim().toLowerCase();

        
        let produse = document.getElementsByClassName("produs")
        for (let prod of produse) {
            prod.style.display = "none";
            let nume = prod.getElementsByClassName("val-nume")[0].innerHTML.trim().toLowerCase()
            let cond1 = nume.includes(inpNume)

            let pret = parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML.trim())
            let cond2 = true;

            let checkedRanges = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'));

            if (checkedRanges.length === 0 || checkedRanges.some(r => r.value === "toate")) {
                cond2 = true;
            } else {
                cond2 = checkedRanges.some(range => {
                    if (range.value === "toate") return true;
                    let [pretMin, pretMax] = range.value.split(":").map(Number);
                    return (pret >= pretMin && pret < pretMax);
                });
            }

            let cond3 = (pret >= inpPret)

            let subcategorie = prod.getElementsByClassName("val-subcategorie")[0].innerHTML.trim().toLowerCase()
            let cond4 = (inpSubCategorie == "toate" || inpSubCategorie == subcategorie)

            let descriereText = prod.getElementsByClassName("val-descriere")[0].innerHTML.trim().toLowerCase();
            let cond5 = true;
            if (isKeywordSearch) {
                cond5 = plusKeywords.every(k => descriereText.includes(k)) &&
                        minusKeywords.every(k => !descriereText.includes(k));
            }

            if (cond1 && cond2 && cond3 && cond4 && cond5) {
                prod.style.display = "block";
            }
        }

    }

        document.getElementById("inp-pret").oninput = function () {
        document.getElementById("infoRange").innerHTML = `(${this.value})`;
        if (this.value < 0 || this.value > 12000) {
            this.classList.add("is-invalid");
            this.classList.remove("is-valid");
        } else {
            this.classList.remove("is-invalid");
            this.classList.add("is-valid");
        }
    }

    document.getElementById("resetare").onclick = function () {
        document.getElementById("inp-nume").value = ""
        document.getElementById("inp-txtarea").value = ""
        document.getElementById("inp-nume").classList.remove("is-invalid");
        document.getElementById("inp-nume").classList.remove("is-valid");
        document.getElementById("inp-nume").focus();

        if (confirm("Sunteti siguri ca vreti sa resetati toate filtrele?")) {
            document.getElementById("i_rad4").checked = true;
            document.getElementById("subcat-toate").checked = true;
            document.getElementById("inp-pret").value = 0;
            document.getElementById("infoRange").innerHTML = "(0)";

            document.querySelectorAll('.row input[type="checkbox"]').forEach(checkbox => {
                checkbox.checked = checkbox.value === "toate";
            });
            let container = document.querySelector(".grid-produse");
            produseInitiale.forEach(prod => {
                container.appendChild(prod);
                prod.style.display = "block";
            });
            const warnp = document.getElementById("warnp");
            if (warnp) warnp.remove();
        } else return;
        // let produse= document.getElementsByClassName("produs")


    }
    document.getElementById("sortCrescNume").onclick = function () {
        if (!validateInputs()) {
            return;
        }
        sorteaza(1)
    }
    document.getElementById("sortDescrescNume").onclick = function () {
        if (!validateInputs()) {
            return;
        }
        sorteaza(-1)
    }

    function sorteaza(semn) {
        let produse = document.getElementsByClassName("produs");
        let vProduse = Array.from(produse);
        vProduse.sort(function (a, b) { // a si b sunt <article>
            let pretA = parseFloat(a.getElementsByClassName("val-pret")[0].innerHTML.trim())
            let pretB = parseFloat(b.getElementsByClassName("val-pret")[0].innerHTML.trim())
            if (pretA != pretB) {
                return semn * (pretA - pretB)
            }
            // aici pretA==pretB
            let numeA = a.getElementsByClassName("val-nume")[0].innerHTML.trim().toLowerCase()
            let numeB = b.getElementsByClassName("val-nume")[0].innerHTML.trim().toLowerCase()
            return semn * numeA.localeCompare(numeB)
        })
        for (let prod of vProduse) {
            prod.parentNode.appendChild(prod);
        }

    }

    let btnSum = document.getElementById("btn-suma");
    btnSum.onclick = function () {
        let produse = document.getElementsByClassName("produs")
            sumaPreturi = 0
            for (let prod of produse) {
                if (prod.style.display != "none") {
                    let pret = parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML.trim())
                    sumaPreturi += pret
                }
            }
            if (!document.getElementById("suma_preturi")) {
                let divRezultat = document.createElement("div");
                divRezultat.id = "calcule_preturi";
                divRezultat.style.cssText = `
                position: fixed;
                top: 50px;
                left: 20px;
                background-color: var(--culoare-rosie);
                color: var(--culoare-gri);
                padding: 15px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.5);
                z-index: 1000;
            `;
                divRezultat.innerHTML = `
                <p>Suma totală: ${sumaPreturi.toFixed(2)} RON</p>   
            `;

                document.body.appendChild(divRezultat);

                setTimeout(function () {
                    let div = document.getElementById("calcule_preturi");
                    if (div) {
                        div.remove();
                    }
                }, 2000);
            }
        }
        
  
    document.getElementById("inp-nume").oninput = function () {
        // validateInputs();
        if (this.value.trim().length < 3) {
            this.classList.add("is-invalid");
            this.classList.remove("is-valid");
        } else {
            this.classList.remove("is-invalid");
            this.classList.add("is-valid");
        }

    }

}

function validateInputs() {
    let isValid = true;
    const inpNume = document.getElementById("inp-nume");
    const inpTxtarea = document.getElementById("inp-txtarea");
    const inpPret = document.getElementById("inp-pret");
    let errorDiv = document.getElementById("error-messages");


    if (errorDiv) errorDiv.innerHTML = "";

    if(inpNume.value.length) {
        if (/[\+-.,!?]/.test(inpNume.value)) {
            isValid = false;
            if (!errorDiv) {
                errorDiv = createErrorDiv();
            }

            appendError(errorDiv, "Numele nu trebuie sa contina simboluri precum + - . , ! ?");
            inpNume.classList.add("is-invalid");
            inpNume.classList.remove("is-valid");
        } else {
            inpNume.classList.remove("is-invalid");
            inpNume.classList.add("is-valid");
        }
        if (inpNume.value.length < 3) {
            isValid = false;
            if (!errorDiv) {
                errorDiv = createErrorDiv();
            }
            appendError(errorDiv, "Numele trebuie sa aiba minim 3 caractere.");
            inpNume.classList.add("is-invalid");
            inpNume.classList.remove("is-valid");
        } else {
            inpNume.classList.remove("is-invalid");
            inpNume.classList.add("is-valid");
        }
    }
    

    const txtValue = inpTxtarea.value.trim();
    if (txtValue.length > 0 && !txtValue.includes("+") && !txtValue.includes("-")) {
        isValid = false;
        if(!errorDiv) {
            errorDiv = createErrorDiv();
        }
        appendError(errorDiv, "Textarea trebuie să conțină '+' sau '-' pentru filtrare avansată.");
    } 

    if (inpPret.value < 0 || inpPret.value > 12000) {
        isValid = false;
        if (!errorDiv) {
            errorDiv = createErrorDiv();
        }
        appendError(errorDiv, "Pretul trebuie sa fie intre 0 si 12000");
        inpPret.classList.add("is-invalid");
        inpPret.classList.remove("is-valid");
    } else {
        inpPret.classList.remove("is-invalid");
        inpPret.classList.add("is-valid");
    }

    if (isValid && errorDiv) {
        errorDiv.remove();
    }

    return isValid;
}

function createErrorDiv() {
    let errorDiv = document.createElement("div");
    errorDiv.id = "error-messages";
    errorDiv.style.cssText = `
        position: fixed;
        top: 50px;
        right: 50px;
        background-color: var(--culoare-rosie);
        color: var(--culoare-gri);
        padding: 15px;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0,0,0,0.5);
        z-index: 1000;
    `;
    document.body.appendChild(errorDiv);
    return errorDiv;
}

function appendError(errorDiv, message) {
    let p = document.createElement("p");
    p.textContent = message;
    p.style.margin = "5px 0";
    errorDiv.appendChild(p);


    setTimeout(() => {
        p.remove();
        if (errorDiv.children.length === 0) {
            errorDiv.remove();
        }
    }, 3000);
}

function multiple_select() {
    const checkboxes = ['i_rad1', 'i_rad2', 'i_rad3'];
    const btnTotal = document.getElementById('i_rad4');
    for (let check of checkboxes) {
        document.getElementById(check).onclick = function () {
            if (btnTotal.checked) {
                btnTotal.checked = false;
            }
        }
    }
   
}
//console.log(btn.id)