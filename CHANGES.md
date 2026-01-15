# Bugfix: Pause minimum du midi

## Problème
La règle de pause minimum du midi n'était pas appliquée dans le calcul des heures payées :
- Si la pause entre 12h et 14h est inférieure à 1h, 1h minimum doit être déduite
- Si la pause est supérieure ou égale à 1h, la pause réelle est déduite
- Pas de bonus si on fait plus d'une heure de pause

## Solution

### Backend (API)
1. Ajout de 3 nouveaux paramètres de configuration :
   - `noon_minimum_break` : Durée minimum de pause midi (60 minutes par défaut)
   - `noon_break_start` : Début de la plage de pause midi (12h00 par défaut)
   - `noon_break_end` : Fin de la plage de pause midi (14h00 par défaut)

2. Modification de `TimeCalculator.php` :
   - Ajout de la méthode `calculateNoonBreak()` : calcule la durée de la pause qui chevauche la plage 12h-14h
   - Modification de `calculateTotalWorkingHours()` : applique la règle du minimum de 1h
   - La règle s'applique uniquement au calcul des heures payées (pas des heures effectives)

3. Fichiers modifiés :
   - `api/config.php` : Ajout des 3 nouveaux paramètres
   - `api/config.example.php` : Documentation des nouveaux paramètres
   - `api/index.php` : Validation des nouveaux paramètres requis
   - `api/src/services/TimeCalculator.php` : Implémentation de la logique

### Frontend
Aucune modification nécessaire - le frontend affiche les totaux calculés par l'API.

## Exemples

### Cas 1 : Pause < 1h (47 minutes)
- Horaires : 08:30-12:00, 12:47-18:30
- Heures effectives : 9h13
- Heures payées : 8h13 (9h13 - 1h minimum)

### Cas 2 : Pause = 1h exacte
- Horaires : 08:30-12:00, 13:00-18:30
- Heures effectives : 9h00
- Heures payées : 8h00 (9h00 - 1h)

### Cas 3 : Pause > 1h (1h30)
- Horaires : 08:30-12:00, 13:30-18:30
- Heures effectives : 8h30
- Heures payées : 7h00 (8h30 - 1h30)

## Configuration

Pour modifier les paramètres dans `api/config.php` :

```php
'noon_minimum_break' => 60, // 1 heure minimum
'noon_break_start' => 12 * 60, // 12h00
'noon_break_end' => 14 * 60, // 14h00
```
