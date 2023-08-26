ld     de, 0x400f                       ; [0000] 11 0f 40
ld     bc, 0x0007                       ; [0003] 01 07 00
ld     h, 0x00                          ; [0006] 26 00
ld     l, 0x01                          ; [0008] 2e 01
rst    08                               ; [000a] cf
ld     l, 0x0f                          ; [000b] 2e 0f
rst    08                               ; [000d] cf
ret                                     ; [000e] c9
ld     c, b                             ; [000f] 48
ld     h, l                             ; [0010] 65
ld     l, h                             ; [0011] 6c
ld     l, h                             ; [0012] 6c
ld     l, a                             ; [0013] 6f
ld     hl, 0x000a                       ; [0014] 21 0a 00
