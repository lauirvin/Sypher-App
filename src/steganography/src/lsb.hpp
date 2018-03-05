#include "steganography.hpp"

#ifndef LSB_HPP
#define LSB_HPP

class lsb: public steganography {
    public:
        using steganography::steganography;

        void encode_file(const boost::filesystem::path&);
        void decode_file();

    private:
        void encode_bitstring(const unsigned int&, const unsigned int&, const boost::dynamic_bitset<>&);
        boost::dynamic_bitset<> decode_bitstring(unsigned int, unsigned int);

        inline unsigned char get_lsb(const unsigned char&);
        inline void set_lsb(unsigned char*, const bool&);
};

#endif
