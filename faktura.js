let currentLp = 1;
const productList = document.getElementById('product-list');
const addRowButton = document.querySelector('.add-row-button');
const descInput = document.querySelector('.input-row .description-input');
const valueInput = document.querySelector('.input-row .value-input');
const quantityInput = document.querySelector('.input-row .quantity-input');
const amountDisplay = document.querySelector('.input-row .amount-display');
const xmlImporter = document.getElementById('xml-importer');
const loadBtn = document.querySelector('.xml-load-btn');
const exportBtn = document.querySelector('.xml-export-btn');

function calculateAmount() {
    const value = parseFloat(valueInput.value) || 0;
    const quantity = parseInt(quantityInput.value) || 0;
    const amount = (value * quantity).toFixed(2);
    amountDisplay.value = amount;
}

function updateLp() {
    const rows = productList.querySelectorAll('.product-row');
    rows.forEach((row, index) => {
        row.querySelector('.lp-cell').textContent = (index + 1) + '.';
    });
    currentLp = rows.length + 1;
}

function generateRow(lp, description, value, quantity, amount) {
    const row = document.createElement('div');
    row.classList.add('product-row');
    row.innerHTML = `
        <div class="lp-cell">${lp}.</div>
        <div class="description-cell">${description}</div>
        <div class="value-cell">${value.toFixed(2)}</div>
        <div class="quantity-cell">${quantity}</div>
        <div class="amount-cell">${amount.toFixed(2)}</div>
        <button class="remove-btn">Usuń</button>
    `;
    productList.appendChild(row);
    row.querySelector('.remove-btn').addEventListener('click', () => {
        row.remove();
        updateLp();
    });
}

addRowButton.addEventListener('click', () => {
    const description = descInput.value.trim();
    const value = parseFloat(valueInput.value);
    const quantity = parseInt(quantityInput.value);
    const amount = parseFloat(amountDisplay.value);

    if (description && value > 0 && quantity > 0) {
        generateRow(currentLp++, description, value, quantity, amount);
        descInput.value = '';
        valueInput.value = '';
        quantityInput.value = '';
        amountDisplay.value = '';
    } else {
        alert('Wypełnij poprawnie Usługa, Wartość i Ilość.');
    }
});

valueInput.addEventListener('input', calculateAmount);
quantityInput.addEventListener('input', calculateAmount);

function createInvoiceXML() {
    let xmlOutput = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xmlOutput += '<Faktura>\n';
    xmlOutput += '  <Dane>\n';
    xmlOutput += `    <Numer.Faktury>${document.getElementById('numerFaktury').value || ''}</Numer.Faktury>\n`;
    xmlOutput += `    <Data.Wystawienia>${document.getElementById('data_wystawienia').value || ''}</Data.Wystawienia>\n`;
    xmlOutput += `    <Data.Sprzedazy>${document.getElementById('data_sprzedazy').value || ''}</Data.Sprzedazy>\n`;
    xmlOutput += '    <Klient>\n';
    xmlOutput += `      <Nazwa.Klient>${document.getElementById('klient').value || ''}</Nazwa.Klient>\n`;
    xmlOutput += `      <Adres.Klienta>${document.getElementById('adres_klient').value || ''}</Adres.Klienta>\n`;
    xmlOutput += `      <NIP.Klienta>${document.getElementById('klient_nip').value || ''}</NIP.Klienta>\n`;
    xmlOutput += '    </Klient>\n';
    xmlOutput += '    <Sprzedawca>\n';
    xmlOutput += `      <Nazwa.Sprzedawca>${document.getElementById('sprzedawca').value || ''}</Nazwa.Sprzedawca>\n`;
    xmlOutput += `      <Adres.Sprzedawcy>${document.getElementById('adres_sprzedawca').value || ''}</Adres.Sprzedawcy>\n`; // POPRAWIONE: adres_sprzedawca
    xmlOutput += `      <NIP.Sprzedawcy>${document.getElementById('sprzedawca_nip').value || ''}</NIP.Sprzedawcy>\n`;
    xmlOutput += '    </Sprzedawca>\n';
    xmlOutput += '  </Dane>\n';
    xmlOutput += '  <Pozycje>\n';
    const rows = productList.querySelectorAll('.product-row');
    rows.forEach((row, index) => {
        const value = row.querySelector('.value-cell').textContent.replace(',', '.');
        const quantity = row.querySelector('.quantity-cell').textContent;
        const amount = row.querySelector('.amount-cell').textContent.replace(',', '.');
        xmlOutput += `    <Produkt Lp="${index + 1}">\n`;
        xmlOutput += `      <Opis>${row.querySelector('.description-cell').textContent}</Opis>\n`;
        xmlOutput += `      <Wartosc.Za.Jeden>${value}</Wartosc.Za.Jeden>\n`;
        xmlOutput += `      <Ilosc>${quantity}</Ilosc>\n`;
        xmlOutput += `      <Kwota.Calkowita>${amount}</Kwota.Calkowita>\n`;
        xmlOutput += '    </Produkt>\n';
    });
    xmlOutput += '  </Pozycje>\n';
    xmlOutput += '</Faktura>';
    return xmlOutput;
}

exportBtn.addEventListener('click', (event) => {
    event.preventDefault(); 
    const xmlContent = createInvoiceXML();
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'faktura_' + (document.getElementById('numerFaktury').value || 'nowa') + '.xml';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100); 
});

function getXmlValue(xmlDoc, tagName) {
    const elements = xmlDoc.getElementsByTagName(tagName);
    if (elements && elements.length > 0 && elements[0].textContent) {
        return elements[0].textContent;
    }
    return '';
}

loadBtn.addEventListener('click', () => {
    xmlImporter.click();
});

xmlImporter.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const xmlString = e.target.result;
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, "application/xml");
            
            document.getElementById('numerFaktury').value = getXmlValue(xmlDoc, 'Numer.Faktury');
            document.getElementById('data_wystawienia').value = getXmlValue(xmlDoc, 'Data.Wystawienia');
            document.getElementById('data_sprzedazy').value = getXmlValue(xmlDoc, 'Data.Sprzedazy');

            document.getElementById('klient').value = getXmlValue(xmlDoc, 'Nazwa.Klient');
            document.getElementById('adres_klient').value = getXmlValue(xmlDoc, 'Adres.Klienta');
            document.getElementById('klient_nip').value = getXmlValue(xmlDoc, 'NIP.Klienta');

            document.getElementById('sprzedawca').value = getXmlValue(xmlDoc, 'Nazwa.Sprzedawca');
            document.getElementById('adres_sprzedawca').value = getXmlValue(xmlDoc, 'Adres.Sprzedawcy'); // POPRAWIONE: adres_sprzedawca
            document.getElementById('sprzedawca_nip').value = getXmlValue(xmlDoc, 'NIP.Sprzedawcy');
            
            const produkty = xmlDoc.getElementsByTagName('Produkt');
            
            productList.innerHTML = '';
            currentLp = 1;

            if (produkty.length > 0) {
                Array.from(produkty).forEach(p => {
                    const desc = p.getElementsByTagName('Opis')[0]?.textContent || 'Brak opisu';
                    const value = parseFloat(p.getElementsByTagName('Wartosc.Za.Jeden')[0]?.textContent) || 0;
                    const quantity = parseInt(p.getElementsByTagName('Ilosc')[0]?.textContent) || 0;
                    const amount = parseFloat(p.getElementsByTagName('Kwota.Calkowita')[0]?.textContent) || (value * quantity);
                    generateRow(currentLp++, desc, value, quantity, amount);
                });
            }
            alert('Dane faktury zostały pomyślnie załadowane.');

        } catch (error) {
            console.error("Błąd parsowania XML:", error);
            alert('Wystąpił błąd podczas wczytywania pliku XML. Sprawdź konsolę.');
        }
    };
    reader.readAsText(file);
});


