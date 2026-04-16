# Viikon Ruokaostokset

Tämä on yksinkertainen ja tyylikäs selainsovellus viikon ruokaostosten hallintaan.

## Julkaisu GitHub Pagesiin

Tämä projekti on valmiiksi konfiguroitu toimimaan GitHub Pagesissa. Seuraa näitä ohjeita:

1.  **Luo uusi repositorio GitHubiin.**
2.  **Puske koodi GitHubiin:**
    *   Varmista, että kaikki tiedostot (mukaan lukien `package-lock.json`) ovat mukana.
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin https://github.com/KÄYTTÄJÄNIMI/REPOSIITORION-NIMI.git
    git push -u origin main
    ```
3.  **Aktivoi GitHub Pages:**
    *   Mene GitHubissa projektisi asetuksiin (**Settings**).
    *   Valitse vasemmalta **Pages**.
    *   Kohdassa **Build and deployment > Source**, valitse **GitHub Actions**.
4.  **Valmis!**
    *   Projektin mukana tuleva `.github/workflows/deploy.yml` hoitaa sovelluksen rakentamisen ja julkaisun automaattisesti aina, kun pusket koodia `main`-haaraan.
    *   Muutaman minuutin kuluttua sovelluksesi on livenä osoitteessa `https://KÄYTTÄJÄNIMI.github.io/REPOSIITORION-NIMI/`.

## Ominaisuudet
- Tuotteiden lisäys kategorioittain
- Edistymisen seuranta
- Automaattinen tallennus selaimen muistiin
- Responsiivinen ulkoasu (toimii mobiilissa ja työpöydällä)
- Animaatiot (motion/react)
