#include <fstream>
#include <iostream>

#include "../../src/lsb.hpp"
#include "../../src/lsb.cpp"
#include "../../src/steganography.hpp"
#include "../../src/steganography.cpp"

#define CATCH_CONFIG_MAIN
#include "catch.hpp"

TEST_CASE("encode and decode a file into a png and test that the contents remain the same", "[png]") {
    lsb encode = lsb("../test_files/png.png");
    encode.encode_file("../test_files/lorem_ipsum.txt");

    lsb decode = lsb("../test_files/steg-png.png");
    decode.decode_file();

    std::ifstream read_correct("../test_files/lorem_ipsum.txt");
    std::string correct_content((std::istreambuf_iterator<char>(read_correct)), (std::istreambuf_iterator<char>()));

    std::ifstream read_actual("../test_files/steg-lorem_ipsum.txt");
    std::string actual_content((std::istreambuf_iterator<char>(read_actual)), (std::istreambuf_iterator<char>()));

    REQUIRE(correct_content == actual_content);
}

TEST_CASE("encode and decode a file into a jpeg and test that the contents remain the same", "[jpeg]") {
    lsb encode = lsb("../test_files/jpeg.jpeg");
    encode.encode_file("../test_files/lorem_ipsum.txt");

    lsb decode = lsb("../test_files/steg-jpeg.png");
    decode.decode_file();

    std::ifstream read_correct("../test_files/lorem_ipsum.txt");
    std::string correct_content((std::istreambuf_iterator<char>(read_correct)), (std::istreambuf_iterator<char>()));

    std::ifstream read_actual("../test_files/steg-lorem_ipsum.txt");
    std::string actual_content((std::istreambuf_iterator<char>(read_actual)), (std::istreambuf_iterator<char>()));

    REQUIRE(correct_content == actual_content);
}
