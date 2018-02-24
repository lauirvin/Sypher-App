#include <bitset>
#include <fstream>
#include <iostream>
#include <string>

#include <boost/dynamic_bitset.hpp>
#include <boost/filesystem.hpp>
#include <opencv2/core/core.hpp>
#include <opencv2/highgui/highgui.hpp>

#ifndef STEGANOGRAPHY_HPP
#define STEGANOGRAPHY_HPP

class steganography {
    public:
        explicit steganography(const std::string& image_path) {
            this -> image_path = image_path;
            this -> image = cv::imread(image_path, -1);
            this -> image_size  = this -> image.rows * this -> image.cols * this -> image.channels();

            if (!this -> image.data) {
                std::cerr << "Failed to open input image no such file or directory" << std::endl;
                exit(1);
            }
        };

        void encode_file(const boost::filesystem::path&) {};
        void decode_file() {};

    protected:
        cv::Mat image;
        boost::filesystem::path image_path;
        unsigned int image_size;

        void load_file(boost::dynamic_bitset<>*, const boost::filesystem::path&);
        void save_file(const boost::filesystem::path&, const boost::dynamic_bitset<>&);

        void encode_filename(boost::dynamic_bitset<>*, const std::string&);

        boost::dynamic_bitset<> string_to_binary(const std::string&);
        std::string binary_to_string(const boost::dynamic_bitset<>&);
};

#endif // STEGANOGRAPHY_HPP
