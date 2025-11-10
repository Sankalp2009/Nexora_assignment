import React from "react";

import {
  Box,
  Flex,
  Heading,
  IconButton,
  Badge,
} from "@chakra-ui/react";

import { Link } from "react-router-dom";

import { ShoppingCart } from "lucide-react";

import useSWR from "swr";

const fetcher = (...args) => fetch(...args).then((res) => res.json());

const Header = () => {
  const { data } = useSWR(
    `http://127.0.0.1:5000/api/cart`,
    fetcher,
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
    }
  );

  const cartCount = data?.result || 0;

  return (
    <Box
      as="header"
      position="sticky"
      top="0"
      zIndex="1000"
      bg="white"
      boxShadow="0 2px 8px rgba(0,0,0,0.08)"
      backdropFilter="blur(10px)"
      transition="all 0.3s ease"
    >
      <Box maxW="1400px" mx="auto" px={{ base: "4", md: "6", lg: "8" }}>
        <Flex
          h={{ base: "70px", md: "80px" }}
          alignItems="center"
          justifyContent="space-between"
        >
          {/* Logo */}
          <Link to="/" style={{ textDecoration: "none" }}>
            <Flex alignItems="center" gap="2">
              <Heading
                size={{ base: "lg", md: "xl" }}
                bgGradient="linear(to-r, purple.500, blue.400)"
                bgClip="text"
                fontWeight="400"
                letterSpacing="tight"
              >
                Vibe Commerce
              </Heading>
            </Flex>
          </Link>

          {/* Cart Icon with Badge */}
          <Link to="/Checkout/cart">
            <Box position="relative" cursor="pointer">
              <IconButton
                variant="ghost"
                colorScheme="gray"
                size="lg"
                _hover={{ bg: "gray.100" }}
                icon={<ShoppingCart size={24} />}
                aria-label="Shopping Cart"
              />
              {cartCount > 0 && (
                <Badge
                  position="absolute"
                  top="-1"
                  right="-1"
                  colorScheme="red"
                  borderRadius="full"
                  fontSize="xs"
                  minW="20px"
                  h="20px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontWeight="bold"
                >
                  {cartCount}
                </Badge>
              )}
            </Box>
          </Link>
        </Flex>
      </Box>
    </Box>
  );
};

export default Header;