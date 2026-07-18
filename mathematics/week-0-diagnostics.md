# Week 0 Mathematics Diagnostics

Completed: 2026-07-18

## 1. Decimal to binary and hexadecimal

### Decimal 13

- Binary place values: `8 + 4 + 1 = 13`, so `13_10 = 1101_2`.
- Hexadecimal: `13` maps to digit `D`, so `13_10 = D_16`.

### Decimal 42

- Binary place values: `32 + 8 + 2 = 42`, so `42_10 = 101010_2`.
- Hexadecimal division: `42 = 2 * 16 + 10`; hexadecimal digit 10 is `A`, so `42_10 = 2A_16`.

### Decimal 255

- Binary place values: `128 + 64 + 32 + 16 + 8 + 4 + 2 + 1 = 255`, so `255_10 = 11111111_2`.
- Hexadecimal division: `255 = 15 * 16 + 15`; hexadecimal digit 15 is `F`, so `255_10 = FF_16`.

## 2. Matrix multiplication by hand

Given:

```text
A = [1  2  3]      B = [1  2]
    [0  1  4]          [3  4]
                       [5  6]
```

The inner dimensions match: a `2 x 3` matrix multiplied by a `3 x 2` matrix produces a `2 x 2` matrix.

```text
C(1,1) = 1*1 + 2*3 + 3*5 = 22
C(1,2) = 1*2 + 2*4 + 3*6 = 28
C(2,1) = 0*1 + 1*3 + 4*5 = 23
C(2,2) = 0*2 + 1*4 + 4*6 = 28

A * B = [22  28]
        [23  28]
```

Independent learner check still required: redo the conversions and multiplication without referring to this file.
