---
layout: post
title:  "My Arch Linux Build"
image: "/assets/arch.png"
image-desc: "Arch logo"
description: "A definitive guide to installing Arch Linux on a BTRFS file system with full data LUKS encryption. Designed for modern computers with SSD and UEFI support."
author: "Teran"
---

My first dive into Linux was when I was 14 or 15 years old. I had been following a bunch of hacking forums for years and kept hearing about "BackTrack Linux" (the OG hacking distro, precursor to Kali). Back then, all I knew about Linux was that it was some alternative to Windows that hackers used. It fascinated me. I read and watched everything I could find about it. I couldn't believe that it was free! I couldn't believe the number of hacking tools it came with! In my young mind, all it would took to become a hacker was installing BackTrack. Following their wiki, I was able to create a persistent, live USB that I could boot to on my computer. Naturally, I immediately ran a brunch of programs and turned into the worlds wimpiest script kitty. With some practice, I managed to man-in-the-middle my dad's computer and crack the WiFi password (that I already knew). That was about as far as my hacking career went.

After several attempted dual boots, a misaligned Windows partition, and countless broken installs, I was comfortably running BackTrack along side Windows on by crappy, high school Acer NetBook. Just like the pros! I quickly lost interest in hacking, drawn instead to the world of Linux. I became a distro hopping fiend, trying every flavor of Linux I could get my hands on. I created an insane number of live USBs and eventually learned how to use VirtualBox to avoid my computer's minute-long reboots. I was well on my way to becoming a Linux master!

And then it happened. 11th grade rolled around and I was issued a school computer. A MacBook, filled to the brim with parental controls and monitoring software. The Acer was handed down to my sister and I was left, stuck between the confines of the school's IT department and the Apple ecosystem. It wasn't until the end of my senior year (when I no longer cared if my computer broke), that I took the weeks long plunge into dual booting Linux on my MacBook. I spent many hours reading through tutorials and man pages, trying to figure out how to boot to a live USB. Once I got that working, I stumbled upon rEFIt (now rEFInd), which unlocked the boot loader and allowed me to successfully install Linux!

College rolled around and I abandoned the security of Windows all together, switching to Linux as my main operating system. It has been a journey trying to keep everything running smoothly. The NVida card that came with my new Dell didn't help. I came to favor Ubuntu's LTS releases, since they offered stability and compatibility with most of the software my classes required. 

Now that I have some solid years of Linux experience under my belt, it is time. Time for me to take the rite of passage and install Arch Linux. Below I will outline the _exact_ steps I use for this process, partly for your benefit, dear reader, but mostly so that I can replicate them if it ever falls apart. I will detail the steps I use for customizing it in another post. 

# Goals

* UEFI w/ Secure Boot
* BTRFS filesystem
* LUKS encryption
* SSD support
* Swap partition
* ZSH shell with Oh-My-ZSH
* NVidia support

# Pre-Installation

## Internet

First thing first, we need internet. I have an Ethernet connection so I didn't have to configure anything. If you are using WiFi, follow [these](https://wiki.archlinux.org/index.php/Iwd#iwctl) steps. Now lets make sure we are connected:
{% highlight bash %}
ping archlinux.org
{% endhighlight %}

## Partitioning Disks

Next we need to partition our hard drive(s). I will be setting up three partitions:

|---
| Mount point | Partition | Type       | Filesystem | Size   |
|---
| /mnt/boot   | /dev/sda1 | EFI System | FAT32      | 550 MB |
| [swap]      | /dev/sda2 | Linux swap | SWAP       | 4 GB   |
| /mnt        | /dev/sda3 | Linux      | BTRFS      | 507 GB |

The first partition is going to be the boot partition. This is required for UEFI and for performance reasons, must remain unencrypted. Make sure that secure boot is enabled to ensure it is not tampered with. 

Second, we have a partition that will be used for swap. This isn't required unless you want the ability to hibernate, in which case you need a swap partition that is at least as big as the amount of RAM your system has. My system has 16 GB, so I would need a 16+ GB swap partition. Swap can also be used if your system ever runs out of RAM, by temporarily writing data from RAM to the hard drive. These days, computers have enough RAM that this will likely never happen. If it ever does, your system will slow to a crawl and it won't do you any good anyway. Personally, I don't care for hibernation but I am still reserving a couple of GBs for the odd program that wants to makes use of it. 

The last partition will be our root partition. This will be where Linux is installed. Because we are using BTRFS, we will be dividing it into subvolumes before installing. If you ever choose to add additional hard drives to your system, BTRFS can easily be expanded to include that drive. 

We will be using fdisk to create the partitions noted above. Run the following to display the available hard drives:
{% highlight bash %}
fdisk -l
{% endhighlight %}
I only have one SSD that I will be installing to. Eventually, I will update this for installing two drives with RAID1. My drive is `/dev/sda`. Replace all occurrences of this with the name of your drive below. 

**NOTE:** Ignore any `loopx` devices. 

Open the device for editing: 
{% highlight bash %}
fdisk /dev/sda
{% endhighlight %}
Create a GPT partition table: `g`.
Create the EFI partition: `n, default number, default first sector, +550M`.
Create the swap partition: `n, default number, default first sector, +4G`.
Create the root partition: `n, default number, default first sector, default last sector`.

Now we need to set the partition types. This only sets a flag on the partition, it does _not_ create the file systems. We'll do that next. Set the first partition to EFI: `t, 1, 1`. Set the second partition to swap: `t, 2, 19`. You can see a list of partition types and their codes by running `l`. 

Now that we have all of the partitions set up, run `p` to print the planned partition table. Once you are satisfied that everything looks correct, run `w` to write the changes. 

## Create File Systems

We'll start out by creating a FAT32 file system on the boot partition. UEFI requires the partition be FAT12, FAT16 or FAT32 but I've never heard of anyone using anything other than FAT32. 
{% highlight bash %}
mkfs.fat -F32 -n EFI /dev/sda1
{% endhighlight %}

Before we encrypt the swap and root partitions, we need to find the encryption algorithm that runs the best on our hardware. Most modern CPUs have built-in support for certain algorithms. To find this, run the following and choose the top option. 
{% highlight bash %}
cryptsetup benchmark
{% endhighlight %}

My system has runs significantly faster with `aes-xts-plain64` so I will be using it for my install. If yours is different, replace it in the commands below. Now we want to set up LUKS on the root partition. We will be using `LUKS1` since GRUB does not yet support `LUKS2`. We will also be setting the alignment for better SSD support. 
{% highlight bash %}
cryptsetup --type luks1 --align-payload=8192 -s 256 -c aes-xts-plain64 luksFormat /dev/sda3
cryptsetup open /dev/sda3 cryptarch
{% endhighlight %}

We are also encrypting the swap partition.
{% highlight bash %}
cryptsetup open --type plain --key-file /dev/urandom /dev/sda2 cryptswap
mkswap -L swap /dev/mapper/cryptswap
swapon -L swap
{% endhighlight %}

Last but not least, lets install BTRFS on the root partition:
{% highlight bash %}
mkfs.btrfs --force -L arch /dev/mapper/cryptarch
{% endhighlight %}

And there you have it! We have successfully set up all of the partitions and file systems needed for our Arch install. 

## BTRFS Setup

Now that we have BTRFS set up, we need to configure it so that it will work with snapshots. BTRFS uses subvolumes for this. At the top we have the root level. Below this, there can be any number of different subvolume trees. Only subvolumes _below_ the root can be snapshotted. So if you want to take snapshots of the root Arch install, this needs to be installed below the BTRFS root level. To read more about this, see the [SysAdmin Guild](https://btrfs.wiki.kernel.org/index.php/SysadminGuide). 

I will be creating three subvolume: root, home, and snapshots. Root will contain the entire Linux filesystem, except for /home, which will be in the home subvolume. This way, I can easily take snapshots of the system, without including my personal documents (recommended). It is also possible to take snapshots of the home subvolume, but these snapshots will be large, due to frequent file changes. All of these snapshots will be stored in the snapshots subvolume, for simplicity. 

To do this, we mount the root partition (that we unencrypted earlier), and use the btrfs utility to create subvolumes.

{% highlight bash %}
mount -t btrfs /dev/mapper/cryptarch /mnt
btrfs subvolume create /mnt/root
btrfs subvolume create /mnt/home
btrfs subvolume create /mnt/snapshots
umount -R /mnt
{% endhighlight %}

In order to correctly install linux, we need to remount each subvolume to the correct path within the system. For example, we want to mount the home subvolume at /home, so that all of the linux files for home are written there. First we need to create the mount locations. 
{% highlight bash %}
mkdir /mnt/home
mkdir /mnt/.snapshots
mkdir /mnt/boot
{% endhighlight %}

When we mount the subvolumes, we will be using the following options. We want to use lzo compression since it is the fastest. We set ssd so that it is optimized for our hard drive. And we use noatime because btrfs requires it. 
{% highlight bash %}
o_btrfs=defaults,compress=lzo,ssd,noatime
{%endhighlight %}

Now we mount our subvolumes. We will be using /mnt as the base for our install, which is where we will mount the root subvolume. The home subvolume will be mounted to /mnt/home. The snapshot subvolume will be mounted to the hidden directory /mnt/.snapshots. And lastly, the EFI boot partition we made previously will be mounted to /mnt/boot. 
{% highlight bash %}
mount -t btrfs -o subvol=root,$o_btrfs /dev/mapper/cryptarch /mnt
mount -t btrfs -o subvol=home,$o_btrfs /dev/mapper/cryptarch /mnt/home
mount -t btrfs -o subvol=snapshots,$o_btrfs /dev/mapper/cryptarch /mnt/.snapshots
mount /dev/sda1 /mnt/boot
{% endhighlight %}

We are now ready to install Arch! 

# Installation

## Install Arch
To install, we are just running pacstrap. Most tutorials only list `base` in the pacstrap install. **These are outdated**. Base no longer includes the linux package. Here we are installing base, linux and linux-firmware. We are also installing support for btrfs (btrfs-progs), my Intel CPU (intel-ucode), grub (grub and efibootmgr), networking (iproute2 and dhcpcd) and of course vim. 
{% highlight bash %}
pacstrap /mnt base btrfs-progs linux linux-firmware intel-ucode grub efibootmgr iproute2 dhcpcd vim
{% endhighlight %}

We need to generate /etc/fstab so that our system knows what to mount each time we boot. In our case, all of the BTRFS subvolumes and the swap partition. Luckily, a utility exists for generating this for us: 
{% highlight bash %}
genfstab -L -p /mnt >> /mnt/etc/fstab
vim /mnt/etc/fstab
{% endhighlight %}

## Configure System
Now that everything is installed, we are going to chroot into the system to configure Arch. Chroot allows us to run commands as if we were booted into the system. 
{% highlight bash %}
arch-chroot /mnt
{% endhighlight %}

Set the timezone to your location:
{% highlight bash %}
ln -sf /usr/share/zoneinfo/America/Denver /etc/localtime
{% endhighlight %}

Set the hardware clock:
{% highlight bash %}
hwclock --systohc
{% endhighlight %}

Set your locale by editing the following file and uncommenting the correct line (in my case `en_US.UTF-8`):
{% highlight bash %}
vim /etc/locale.gen
locale-gen
{% endhighlight %}

Create a locale configuration file:
{% highlight bash %}
echo LANG=en_US.utf8 >> /etc/locale.conf
echo LANGUAGE=en_US >> /etc/locale.conf
{% endhighlight %}

Set your keyboard layout:
{% highlight bash %}
echo KEYMAP=us >> /etc/vconsole.conf
{% endhighlight %}

Set your hostname:
{% highlight bash %}
echo arch >> /etc/hostname
{% endhighlight %}

Configure /etc/hosts as below:
{% highlight shell %}
127.0.0.1       localhost
::1             localhost
127.0.1.1       arch
{% endhighlight %}

Set the root password:
{% highlight bash %}
passwd
{% endhighlight %}

## Fix Boot Settings
In order to get our system to boot properly with btrfs, we need to add `encrypt` and `btrfs` to initramfs HOOKS:
{% highlight bash %}
vim /etc/mkinitcpio.conf
mkinitcpio -p linux
{% endhighlight %}

We also need to add our swap partition to /etc/crypttab so that it is properly decrypted during boot:
{% highlight bash %}
vim /etc/crypttab
{% endhighlight %}
Add `swap   /dev/sda2       /dev/urandom        swap,offset=2048,cipher=aes-xts-plain64,size=256`

## Install Grub
Last thing we need to do to set up our system is installing Grub. Right now, Grub is the only boot loader with support for encrypted BTRFS. 
{% highlight bash %}
vim /etc/default/grub
{% endhighlight %}

{% highlight shell %}
GRUB_ENABLE_CRYPTODISK=y
GRUB_DISABLE_SUBMENU=y
GRUB_CMDLINE_LINUX="cryptdevice=/dev/sda3:cryptarch:allow-discards"
{% endhighlight %}

{% highlight bash %}
grub-install --target=x86_64-efi --efi-directory=/boot --bootloader-id=GRUB
grub-mkconfig -o /boot/grub/grub.cfg
{% endhighlight %}

## Reboot
And now we reboot...
{% highlight bash %}
exit
umount -R /mnt
reboot
{% endhighlight %}

## Verify Install
If the system booted in under a minute, then everything should be set up correctly with LUKS. Lets check that all three of our BTRFS subvolumes are mounted:
{% highlight bash %}
findmnt -nt btrfs
{% endhighlight %}

Lets also check that the swap partition unencrypted properly:
{% highlight bash %}
lsblk
{% endhighlight %}

Finally, lets take a snapshot of our brand new install before we accidentally ruin it:
{% highlight bash %}
btrfs subvolume snapshot / /.snapshots/2020-12-03
ls .snapshots
btrfs subvolume list /
{% endhighlight %}

And we're done! Time to configure...

_The end_
