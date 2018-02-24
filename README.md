# Steganography
## Linux

**Prerequisites**

1. You should make sure that you have installed your distribution's 'system.devel' collection.
2. You will also need to install required developent files for
    * [opencv](https://opencv.org/) - image manipulation.
    * [boost](http://www.boost.org/) - filesystem/dynamic_bitset.

**Compile**

1. Change directory into '/src/steganography/'.
2. Run 'make configure'. This will fetch any needed header files ([optparse.hpp](https://github.com/myint/optparse/)).
3. Run 'make' which will compile the program.
4. The final executable file will be '/bin/steganography'.

## Windows
Install [WSL](https://en.wikipedia.org/wiki/Windows_Subsystem_for_Linux) and follow the instructions for Linux.
