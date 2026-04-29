# Flux89 GT7 Tuning Logic Extraction

## 1. The Tuning Order
1. Tires (Everything depends on grip)
2. Downforce / Aero
3. Ride Height
4. Natural Frequency (Springs)
5. Anti-Roll Bars
6. Dampers (Compression & Expansion)
7. Camber
8. Toe
9. LSD / Differential
10. Transmission
11. Brake Balance

## 2. Aerodynamics (Downforce)
- **Track Speed Approach**:
    - Low-Speed (Tsukuba): Front 70-80%, Rear 90-100% of range.
    - Mid-Speed (Suzuka): Front 40-60%, Rear 55-75% of range.
    - High-Speed (Monza, Le Mans): Front 10-30%, Rear 20-40% of range.
- **Rake Effect**: Rear higher than front (positive rake) generates more rear grip at speed but more oversteer.

## 3. Ride Height
- **Rake**: Front lower than rear (positive rake) promotes rotation/oversteer. Neutral balance = Front & Rear equal.
- **Starting Position**: Front 3-5 clicks above min, Rear 5-8 clicks above min.
- **Bumpy Tracks**: Add 2-3 clicks to both ends.

## 4. Natural Frequency (Springs)
- **Tire Compound Scaling**:
    - Comfort Hard: 25-30% of range
    - Sports Hard: 40-45% of range
    - Racing Soft: 75-85% of range
- **Rear Offset**: GT7 has a built-in rear offset; setting both sliders to the same relative position makes the rear naturally stiffer.
- **Weight Factor**: Heavy cars (>1500kg) need 1-2 clicks stiffer; Light cars (<900kg) 1-2 clicks softer.

## 5. Anti-Roll Bars (ARB)
- **Drivetrain Baseline (Front/Rear)**:
    - FR: 6 / 4
    - FF: 4 / 6
    - MR / RR: 6 / 3
    - AWD: 5 / 5
- **Tire Factor**: Racing tires = add 2 to both ends.
- **Weight Factor**: Heavy cars (>1500kg) = add 1 to both ends.

## 6. Dampers
- **Compression**: Scale 20-40. Start at 28-30.
- **Expansion**: Scale 30-50. Start at 38-40.
- **Cardinal Rule**: Expansion must ALWAYS be higher than compression (game enforces this).

## 7. Camber
- **Tire Compound Scaling**:
    - Comfort: F -0.8 to -1.5, R -0.5 to -1.0
    - Sports: F -1.5 to -2.0, R -1.0 to -1.5
    - Racing: F -2.0 to -2.5, R -1.5 to -2.0
- **Drivetrain**: Front should generally equal or exceed rear (except FF/AWD).

## 8. Toe Angles
- **Starting Position**: Front 0.00 (neutral), Rear +0.05 (slight toe-in).
- **Wheelbase**: Short (Mini) = increase rear to +0.08; Long (NSX) = can use +0.03.

## 9. LSD (Limited Slip Differential)
- **Parameters**: Initial Torque (5-60), Accel Sensitivity (5-60), Braking Sensitivity (5-60).
- **Drivetrain Baseline (Init / Accel / Braking)**:
    - FR: 5-10 / 20-35 / 5-15
    - FF: 5-15 / 25-40 / 5-10
    - MR: 5-8 / 10-20 / 15-30
    - RR: 5-10 / 10-20 / 20-35
    - AWD: Front 5-7 / 5-15 / 5-10; Rear 5-11 / 15-25 / 5-14; Center Split 30:70.

## 10. Brake Balance
- **Drivetrain Baseline**:
    - FR: 1 click rear
    - FF: 1-2 clicks rear
    - MR / RR: 1 click front
    - AWD: Default (0)
