/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from "react";
import {
  Box,
  Image,
  Text,
  Heading,
  Button,
  Stack, 
  Skeleton,
  useColorModeValue,
} from "@chakra-ui/react";

const ProductCard = ({ product, onAddToCart, isLoading }) => {
  const [isAdding, setIsAdding] = useState(false);
  const cardBg = useColorModeValue("white", "gray.800");
  const hoverBg = useColorModeValue("gray.50", "gray.700");

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await onAddToCart(product._id);
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) {
    return (
      <Box
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        p={4}
        bg={cardBg}
        boxShadow="md"
      >
        <Skeleton height="200px" mb={4} />
        <Skeleton height="20px" width="80%" mb={2} />
        <Skeleton height="20px" width="50%" mb={4} />
        <Skeleton height="40px" width="100%" />
      </Box>
    );
  }

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      p={4}
      bg={cardBg}
      boxShadow="sm"
      _hover={{ boxShadow: "xl", transform: "translateY(-4px)", bg: hoverBg }}
      transition="all 0.25s ease"
    >
      {/* Product Image */}
      <Box
        height="220px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg={useColorModeValue("gray.100", "gray.700")}
        borderRadius="md"
        mb={4}
      >
        <Image
          src={product.image}
          alt={product.name}
          maxH="200px"
          objectFit="contain"
          fallbackSrc="https://via.placeholder.com/150"
        />
      </Box>

      {/* Product Info */}
      <Stack spacing={2}>
        <Heading
          as="h3"
          size="md"
          color={useColorModeValue("gray.800", "white")}
          noOfLines={2}
        >
          {product.name}
        </Heading>
        <Text fontSize="lg" fontWeight="600" color="purple.600">
          ₹{(product.price / 100).toFixed(2)}
        </Text>
      </Stack>

      {/* Add to Cart Button */}
      <Button
        mt={4}
        colorScheme="purple"
        w="full"
        onClick={handleAddToCart}
        isLoading={isAdding}
        loadingText="Adding..."
      >
        Add to Cart
      </Button>
    </Box>
  );
};

export default ProductCard;