# Bugfix: Pause minimum du midi

## Problème Initial
La règle de pause minimum du midi n'était pas appliquée dans le calcul des heures payées :
- Si la pause entre 12h et 14h est inférieure à 1h, les minutes "gagnées" ne doivent pas être comptées
- Exemple : pause de 47min → l'utilisateur "gagne" 13 minutes qui ne doivent pas être payées

## Bug Critique Découvert
Lors des tests, un bug critique a été identifié : **les heures payées étaient inférieures aux heures effectives** !
- Cause : déduction excessive des "minutes gagnées" sans limite
- Exemple : 14min de bonus ajoutés, mais 30min de "minutes gagnées" retirées → -16min
- Résultat : Martin avait 29:51 heures effectives mais seulement 26:34 heures payées (écart de -3h17)

## Solution

### Backend (API)

#### 1. Configuration (Commit 1)
Ajout de 3 nouveaux paramètres de configuration :
- `noon_minimum_break` : Durée minimum de pause midi (60 minutes par défaut)
- `noon_break_start` : Début de la plage de pause midi (12h00 par défaut)
- `noon_break_end` : Fin de la plage de pause midi (14h00 par défaut)

Fichiers modifiés :
- `api/config.php` : Ajout des paramètres
- `api/config.example.php` : Documentation
- `api/index.php` : Validation des paramètres requis
- `api/src/services/TimeCalculator.php` : Première implémentation (bugguée)

#### 2. Correction du Bug + Tests (Commit 2)
**Correction** :
- Ajout d'une limite : `deduction = min(gained_minutes, total_bonus_added)`
- Garantit que `paid >= effective` en toutes circonstances
- Les "minutes gagnées" ne peuvent être retirées que dans la limite des bonus déjà accordés

**Suite de tests complète** :
- Création du dossier `tests/` avec 7 cas de test
- Script `tests.sh` pour exécuter les tests via Docker (PHP 8.2-cli)
- Script `analyze_martin.php` pour déboguer les cas complexes
- Validation : 7/7 tests passent ✓

Fichiers ajoutés :
- `api/tests/TimeCalculatorTest.php` : Suite de tests complète
- `api/tests/test_data.php` : Données de test avec cas réels
- `api/tests.sh` : Script d'exécution via Docker
- `api/analyze_martin.php` : Script d'analyse

### Frontend
Aucune modification nécessaire - le frontend affiche les totaux calculés par l'API.

## Exemples (Après Correction)

### Cas 1 : Pause < 1h (47 minutes)
- Horaires : 08:30-12:00, 12:47-18:30
- Heures effectives : 9h13
- Bonus pause : +14min (7min matin + 7min après-midi)
- Minutes gagnées : 13min (60 - 47)
- **Heures payées : 9h14** (9h13 + 14min - 13min)

### Cas 2 : Pause = 1h exacte
- Horaires : 08:30-12:00, 13:00-18:30
- Heures effectives : 9h00
- Bonus pause : +14min
- Minutes gagnées : 0min
- **Heures payées : 9h14** (9h00 + 14min)

### Cas 3 : Pause > 1h (1h30)
- Horaires : 08:30-12:00, 13:30-18:30
- Heures effectives : 8h30
- Bonus pause : +14min
- Minutes gagnées : 0min (pas de pénalité si > 1h)
- **Heures payées : 8h44** (8h30 + 14min)

### Cas 4 : Multiples pauses avec pause midi courte (30min)
- Horaires : 08:30-10:00, 10:15-12:00, 12:30-18:30
- Heures effectives : 9h15
- Bonus pause : +14min (seulement 2 bonus : matin + après-midi)
- Minutes gagnées : 30min (60 - 30)
- Déduction limitée : min(30, 14) = 14min
- **Heures payées : 9h15** (9h15 + 14min - 14min) ✓ Pas inférieur aux heures effectives

## Configuration

Pour modifier les paramètres dans `api/config.php` :

```php
'noon_minimum_break' => 60, // 1 heure minimum
'noon_break_start' => 12 * 60, // 12h00
'noon_break_end' => 14 * 60, // 14h00
```

## Tests

Pour exécuter les tests :

```bash
cd api
./tests.sh
```

Résultat attendu :
```
================================================================================
Test Summary
================================================================================
Passed: 7
Failed: 0
Total:  7
```

## Commits

1. `e94ab6b` - feat: implement noon minimum break rule
2. `ee98406` - fix: correct noon minimum break calculation logic
3. `6292331` - chore: update api submodule with noon break fix
