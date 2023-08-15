; SPDX-FileCopyrightText: 2023 JasonMo <jasonmo2009@hotmail.com>
; SPDX-License-Identifier: Apache-2.0

; Easiest Z80 assembly example

ld bc, 9
ld hl, array
ld de, array+1
ld (hl), 2
ldir
loop: jp loop

array: DEFS 10
