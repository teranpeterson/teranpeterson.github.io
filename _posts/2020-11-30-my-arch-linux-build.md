---
layout: post
title:  "My Arch Linux Build"
author: "Teran"
---

It is time. Time for me to really give arch a go. 

Doing this with EFI boot in Virtual Box (Virtual Box settings)

# Goals

BTRFS, ARCH, i3, ZSH, ENCRYPTED

512MB EFI
4GB Swap
500GB Root

# Pre-Instalation

### Wifi

I didn't have to touch this in VBOX
`ping archlinux.org`

### Disks

`fdisk -l`
/dev/sda
Ignoring /dev/loop0

`fdisk /dev/sda`
`g`

`n``default number``default first sector``+550M`
`n``default number``default first sector``+4G`
`n``default number``default first sector``default last sector`

`t``1``1` for EFI
`t``2``19` for Swap

`p` to check
`w` to write

`mkfs.fat -F32 -n EFI /dev/sda1`
`mkswap /dev/sda2`
`mkfs.btrfs -L arch /dev/sda3`

`modinfo dm_crypt`

`cryptsetup benchmark`

`cryptsetup luksFormat --align-payload=8192 -s 256 -c aes-xts-plain64 /dev/sda3`

`cryptsetup open /dev/sda3 root`

`cryptsetup open --type plain --key-file /dev/urandom /dev/sda2 swap`

`mkswap -L swap /dev/mapper/swap`

`swapon -L swap`

`mkfs.btrfs -L arch /dev/mapper/root`

`mkdir /mnt/arch`
`mount /dev/mapper/root /mnt/arch`
`btrfs subvolume create /mnt/arch/root`
`btrfs subvolume create /mnt/arch/home`
`btrfs subvolume create /mnt/arch/snapshots`
`umount -R /mnt/arch`


# TODO
`mkdir /mnt/arch/home`
`mkdir /mnt/arch/.snapshots`
`mount -o subvol=root /dev/mapper/root /mnt/arch`
`mount -o subvol=home /dev/mapper/root /mnt/arch/home`
`mount -o subvol=snapshots /dev/mapper/root /mnt/arch/.snapshots`

`mkdir /mnt/arch/boot`
`mount /dev/sda1 /mnt/arch/boot`