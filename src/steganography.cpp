#include "steganography.hpp"

/* Breakdown of how the files are stored in images.
   1. Read a file into a string of binary (in this case I am using a dynamic_bitset<>).
   2. Store the length of the string of binary in 32bit binary form.
   3. Prefix the string of binary with its length in binary. (This is how we know how much data to read when decoding).
   4. Loop through every channel of every pixel and set the least significant bit to one in the string of binary in order.

   Breakdown of how the filename is stored.
   1. Convert the filename into its binary representation.
   2. As with determining the length of the string of binary data; create a 32bit binary number which represents the length of the filename.
   3. Prefix the binary filename with its length.
   4. Add this to the beginning of the string of binary data before the first 32bit number is created. (The single string of binary which is encoded contains both the file data and filename)
*/

// Produce a string the string of binary detailed in the breakdown above ^^ and encode it in the image using 'encode_bitstring'
void steganography::encode_file(const boost::filesystem::path& file_path) {
    boost::dynamic_bitset<> bitstring;
    this -> encode_filename(&bitstring, file_path.filename().string());
    this -> load_file(&bitstring, file_path);
    this -> encode_bitstring(bitstring);
};

// Decode the file from the image by doing the inverse of the breakdown at the beginning of this file.
void steganography::decode_file() {
    boost::dynamic_bitset<> bitstring_length = this -> decode_bitstring(0, 32);
    boost::dynamic_bitset<> bitstring_filename_length = this -> decode_bitstring(32, 64);
    boost::dynamic_bitset<> bitstring_filename = this -> decode_bitstring(64, 64 + bitstring_filename_length.to_ulong());
    boost::dynamic_bitset<> bitstring_filedata = this -> decode_bitstring(64 + bitstring_filename_length.to_ulong(), bitstring_length.to_ulong() + 32);

    if (this -> image_path.parent_path().string().size() <= 0) {
        this -> save_file(this -> image_path.parent_path().string() + "steg-" + this -> binary_to_string(bitstring_filename), bitstring_filedata);
    } else {
        this -> save_file(this -> image_path.parent_path().string() + "/steg-" + this -> binary_to_string(bitstring_filename), bitstring_filedata);
    }
};

// // Encode the binary representation of a file into an image. This is the step where a 32bit number is created and prepended to the string of binary.
void steganography::encode_bitstring(boost::dynamic_bitset<>& bitstring) {
    std::bitset<32> bitstring_length = bitstring.size();

    if (bitstring_length.to_ulong() + 32 > this -> image_size) {
        std::cerr << "Not enough room in image to store this file" << std::endl;
        exit(1);
    }

    unsigned int index = 0;
    for (int row = 0; row < this -> image.rows; row++) {
        for (int col = 0; col < this -> image.cols; col++) {
            for (int cha = 0; cha < this -> image.channels(); cha++) {
                if (index < 32) {
                    if (this -> image.channels() == 3) {
                        this -> set_lsb(&this -> image.at<cv::Vec3b>(row, col)[cha], bitstring_length.test(index));
                    } else {
                        this -> set_lsb(&this -> image.at<cv::Vec4b>(row, col)[cha], bitstring_length.test(index));
                    }
                } else {
                    if (this -> image.channels() == 3) {
                        this -> set_lsb(&this -> image.at<cv::Vec3b>(row, col)[cha], bitstring.test(index - 32));
                    } else {
                        this -> set_lsb(&this -> image.at<cv::Vec4b>(row, col)[cha], bitstring.test(index - 32));
                    }
                }

                index++;

                if (index == bitstring_length.to_ulong() + 32) {
                    if (this -> image_path.parent_path().string().size() <= 0) {
                        cv::imwrite(this -> image_path.parent_path().string() + "steg-" + this -> image_path.filename().string(), this -> image);
                    } else {
                        cv::imwrite(this -> image_path.parent_path().string() + "/steg-" + this -> image_path.filename().string(), this -> image);
                    }

                    return;
                }
            }
        }
    }
};

boost::dynamic_bitset<> steganography::decode_bitstring(int start, int end) {
    boost::dynamic_bitset<> bitstring;

    unsigned int index = 0;
    for (int row = 0; row < this -> image.rows; row++) {
        if (index == end) {
            break;
        }
        for (int col = 0; col < this -> image.cols; col++) {
            if (index == end) {
                break;
            }
            for (int cha = 0; cha < this -> image.channels(); cha++) {
                if (index == end) {
                    break;
                }

                if (index >= start) {
                    if (this -> image.channels() == 3) {
                        bitstring.push_back(this -> get_lsb(this -> image.at<cv::Vec3b>(row, col)[cha]));
                    } else {
                        bitstring.push_back(this -> get_lsb(this -> image.at<cv::Vec4b>(row, col)[cha]));
                    }
                }

                index++;
            }
        }
    }

    return bitstring;
};

// Load a file into a binary string (dynamic_bitset<>)
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

// This is the inverse of 'load_file'.
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

// Get the least significant bit from a byte
inline unsigned char steganography::get_lsb(const unsigned char& byte) {
    return byte & 1;
};

// Set the least significant bit in a byte depending on 'bit_value'
inline void steganography::set_lsb(unsigned char* number, const bool& bit_value) {
    if (bit_value) {
        *number = *number | 1;
    } else {
        *number = (*number & ~1) | 0;
    }
};

// Prepare the filename to be encoded into the image (prepend a 32bit numebr detailing how long the filename is)
void steganography::encode_filename(boost::dynamic_bitset<>* bitstring, const std::string& filename) {
    std::bitset<32> filename_length = filename.size() * 8;

    for (int i = 0; i < 32; i++) {
        bitstring -> push_back(filename_length.test(i));
    }

    boost::dynamic_bitset<> binary_filename = this -> string_to_binary(filename);

    for (int i = 0; i < binary_filename.size(); i++) {
        bitstring -> push_back(binary_filename.test(i));
    }
};

// Convert a normal string into its binary representation
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

// Convert a binary string into a normal string. This is the inverse of 'string_to_binary'
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
