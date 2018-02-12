#include <bitset>
#include <fstream>
#include <iostream>
#include <string>

#include <boost/dynamic_bitset.hpp>
#include <boost/filesystem.hpp>
#include <opencv2/core/core.hpp>
#include <opencv2/highgui/highgui.hpp>

class steganography {
    public:
        // constructors
        explicit steganography(const std::string& image_path) {
            this -> image_path = image_path;
            this -> image = cv::imread(image_path, -1);
            this -> image_size  = this -> image.rows * this -> image.cols * this -> image.channels();

            if (!this -> image.data) {
                std::cerr << "Failed to open input image no such file or directory" << std::endl;
                exit(1);
            }
        }

        // encode/decode a file to/from an image
        void encode_file(const boost::filesystem::path&);
        void decode_file();

    private:
        // attributes
        cv::Mat image;
        boost::filesystem::path image_path;
        unsigned int image_size;

        // load/save file to/from a bitstring (boost::dynamic_bitset<>)
        void load_file(boost::dynamic_bitset<>*, const boost::filesystem::path&);
        void save_file(const boost::filesystem::path&, const boost::dynamic_bitset<>&);

        // encode/decode bitstrings (boost::dynamic_bitset<>) to/from and image
        void encode_bitstring(const unsigned int&, const unsigned int&, const boost::dynamic_bitset<>&);
        boost::dynamic_bitset<> decode_bitstring(unsigned int, unsigned int);

        // bit manipulation
        inline unsigned char get_lsb(const unsigned char&);
        inline void set_lsb(unsigned char*, const bool&);

        // filename encoding/decoding
        void encode_filename(boost::dynamic_bitset<>*, const std::string&);
        std::string decode_filename(const boost::dynamic_bitset<>&);

        // string/binary conversion
        boost::dynamic_bitset<> string_to_binary(const std::string&);
        std::string binary_to_string(const boost::dynamic_bitset<>&);
};
