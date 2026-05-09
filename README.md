# ENTECH Landingpage für GitHub Pages

Statische Landingpage ohne Build-System.

## Streamlit-Link ersetzen

Suche in `index.html` nach:

```html
https://DEIN-STREAMLIT-LINK.streamlit.app
```

und ersetze ihn durch deine echte Streamlit-URL.

## GitHub Pages aktivieren

1. Neues GitHub Repository erstellen, z.B. `entech-landingpage`
2. Diese Dateien ins Repository hochladen
3. In GitHub: `Settings` → `Pages`
4. Source: `Deploy from a branch`
5. Branch: `main`
6. Folder: `/root`
7. Speichern

## Vor Veröffentlichung prüfen

- Impressum mit echten Angaben ersetzen
- Datenschutzerklärung ergänzen
- Streamlit-Link ersetzen
- Optional Google Analytics / Tag Manager einbauen
