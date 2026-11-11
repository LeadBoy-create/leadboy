# LeadBoy

Site marketing statique, en français (Québec). Pas de compte, pas de serveur applicatif.

## Lancer

Depuis ce dossier :

```bash
python3 -m http.server 8731 --bind 127.0.0.1
```

Ouvrir [http://127.0.0.1:8731/](http://127.0.0.1:8731/).

Le hero fait défiler tes six illustrations, dans l'ordre, en boucle. Chaque image reste fixe, 3,4 secondes. Clique l'image, défile dessus, ou utilise les flèches du clavier (le cadre doit être sélectionné). Espace met la lecture en pause. Le formulaire enregistre la demande dans ce navigateur, via `localStorage` (`leadboy.demandes`). Rien n'est envoyé.

Les six scènes du film sont dans `assets/brand/scenes/`. Les illustrations d'origine sont dans `assets/brand/original/`.
