; SPDX-FileCopyrightText: 2023 JasonMo <jasonmo2009@hotmail.com>
; SPDX-License-Identifier: Apache-2.0

; Easiest Z80 assembly example

ORG 0x4000
ld de, message
ld bc, 7
ld h, 0
ld l, 1
rst 8
ld l, 15
rst 8
ret
message: db "Hello!\n"