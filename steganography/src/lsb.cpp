#include "lsb.hpp"

void lsb::encode_file(const boost::filesystem::path& file_path) {
    boost::dynamic_bitset<> bitstring;
    this -> encode_filename(&bitstring, file_path.filename().string());
    this -> load_file(&bitstring, file_path);

    std::bitset<32> bitstring_length = bitstring.size();

    if (bitstring_length.to_ulong() + 32 > this -> image_size) {
        std::cerr << "There isn't enough room in this image to store this file" << std::endl;
        exit(1);
    }

    this -> encode_bitstring(0, 32, boost::dynamic_bitset<>(bitstring_length.to_string()));
    this -> encode_bitstring(32, bitstring.size(), bitstring);

    if (this -> image_path.parent_path().string().size() <= 0) {
        cv::imwrite(this -> image_path.parent_path().string() + "steg-" + this -> image_path.filename().string(), this -> image);
    } else {
        cv::imwrite(this -> image_path.parent_path().string() + "/steg-" + this -> image_path.filename().string(), this -> image);
    }
};

void lsb::decode_file() {
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

void lsb::encode_bitstring(const unsigned int& start, const unsigned int& end, const boost::dynamic_bitset<>& bitstring) {
    unsigned int pixel_index = 0;
    unsigned int bitstring_index = 0;
    for (int row = 0; row < this -> image.rows; row++) {
        for (int col = 0; col < this -> image.cols; col++) {
            for (int cha = 0; cha < this -> image.channels(); cha++) {
                if (bitstring_index == end) {
                    return;
                }

                if (pixel_index >= start) {
                    switch (this -> image.channels()) {
                        case 3 : {
                            this -> set_lsb(&this -> image.at<cv::Vec3b>(row, col)[cha], bitstring.test(bitstring_index));
                            break;
                        };

                        case 4 : {
                            this -> set_lsb(&this -> image.at<cv::Vec4b>(row, col)[cha], bitstring.test(bitstring_index));
                            break;
                        };
                    }

                    bitstring_index++;
                }

                pixel_index++;
            }
        }
    }
};

boost::dynamic_bitset<> lsb::decode_bitstring(unsigned int start, unsigned int end) {
    boost::dynamic_bitset<> bitstring;

    unsigned int index = 0;
    for (int row = 0; row < this -> image.rows; row++) {
        for (int col = 0; col < this -> image.cols; col++) {
            for (int cha = 0; cha < this -> image.channels(); cha++) {
                if (index == end) {
                    return bitstring;
                }

                if (index >= start) {
                    switch (this -> image.channels()) {
                        case 3 : {
                            bitstring.push_back(this -> get_lsb(this -> image.at<cv::Vec3b>(row, col)[cha]));
                            break;
                        };

                        case 4 : {
                            bitstring.push_back(this -> get_lsb(this -> image.at<cv::Vec4b>(row, col)[cha]));
                            break;
                        };
                    }
                }

                index++;
            }
        }
    }

    return bitstring;
};

inline unsigned char lsb::get_lsb(const unsigned char& byte) {
    return byte & 1;
};

inline void lsb::set_lsb(unsigned char* number, const bool& bit_value) {
    if (bit_value) {
        *number = *number | 1;
    } else {
        *number = (*number & ~1) | 0;
    }
};
