#include "steganography.hpp"

void steganography::encode_filename(boost::dynamic_bitset<>* bitstring, const std::string& filename) {
    std::bitset<32> filename_length = filename.size() * 8;

    for (int i = 0; i < 32; i++) {
        bitstring -> push_back(filename_length.test(i));
    }

    boost::dynamic_bitset<> binary_filename = this -> string_to_binary(filename);

    for (unsigned int i = 0; i < binary_filename.size(); i++) {
        bitstring -> push_back(binary_filename.test(i));
    }
};

void steganography::load_file(boost::dynamic_bitset<>* bitstring, const boost::filesystem::path& file_path) {
    std::ifstream file(file_path.string(), std::ios::binary);

    std::bitset<8> byte;
    if (file.good()) {
        while (!file.eof()) {
            byte = file.get();
            for (unsigned int i = 0; i < 8; i++) {
                bitstring -> push_back(byte.test(i));
            }
        }
    } else {
        std::cerr << "Failed to open file: " << strerror(errno) << std::endl;
        exit(1);
    }

    file.close();
};

void steganography::save_file(const boost::filesystem::path& file_path, const boost::dynamic_bitset<>& bitstring) {
    std::ofstream file(file_path.string(), std::ios::binary);

    std::bitset<8> buffer;
    if (file.good()) {
        for (unsigned int i = 0; i < bitstring.size(); i++) {
            if (i % 8 == 0 && i != 0) {
                file.put(buffer.to_ulong());
            }
            buffer.set(i % 8, bitstring.test(i));
        }
    } else {
        std::cerr << "Failed to save file: " << strerror(errno) << std::endl;
        exit(1);
    }

    file.close();
};

boost::dynamic_bitset<> steganography::string_to_binary(const std::string& characters) {
    boost::dynamic_bitset<> bitstring;

    std::bitset<8> buffer;
    for (unsigned int i = 0; i < characters.size(); i++) {
        buffer = char(characters.at(i));
        for (unsigned int i = 0; i < buffer.size(); i++) {
            bitstring.push_back(buffer.test(i));
        }
    }

    return bitstring;
};

std::string steganography::binary_to_string(const boost::dynamic_bitset<>& binary) {
    std::string string;

    std::bitset<8> buffer;
    for (unsigned int i = 0; i < binary.size(); i++) {
        if (i % 8 == 0 && i != 0) {
            string += buffer.to_ulong();
        }
        buffer.set(i % 8, binary.test(i));
    }

    string += buffer.to_ulong();
    return string;
};
