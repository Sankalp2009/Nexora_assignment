/* eslint-disable react-hooks/rules-of-hooks */
import React from "react";
import useSWR from "swr";
import { useSWRConfig } from "swr";
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Skeleton,
  SkeletonText,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";

import ProductCard from "../Component/ProductCard.jsx";

const fetcher = (...args) => fetch(...args).then((res) => res.json());

function Home() {
  const { data, error, isLoading } = useSWR(
    `https://nexora-assignment-qg3v.onrender.com/api/products`,
    fetcher
  );

  const { mutate } = useSWRConfig();
  const toast = useToast();

  const textColor = useColorModeValue("gray.800", "white");
  const subColor = useColorModeValue("gray.600", "gray.300");

  const handleAddToCart = async (productId) => {
    try {
      const response = await fetch(`https://nexora-assignment-qg3v.onrender.com/api/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          qty: 1,
        }),
      });

      const result = await response.json();

      if (result.status === "success") {
        // Revalidate cart to update the header badge
        mutate(`https://nexora-assignment-qg3v.onrender.com/api/cart`);
        
        toast({
          title: "Added to cart!",
          description: "Product has been added to your cart.",
          status: "success",
          duration: 1000,
          isClosable: true,
          position: "bottom-right",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to add item to cart.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  if (error) return <div>failed to load</div>;

  if (isLoading) return <div>loading...</div>;

  return (
    <Box as="main" maxW="7xl" mx="auto" px={{ base: 4, sm: 6, lg: 8 }} py={8}>
      {/* Header Section */}
      <Box mb={8}>
        <Heading as="h2" size="xl" fontWeight="bold" color={textColor} mb={2}>
          Featured Products
        </Heading>
        <Text color={subColor}>
          Discover our curated selection of premium tech accessories
        </Text>
      </Box>

      {/* Loading Skeleton State */}
      {isLoading || data?.data?.length === 0 ? (
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing={6}>
          {[...Array(8)].map((_, i) => (
            <Box
              key={i}
              borderWidth="1px"
              borderRadius="lg"
              p={4}
              bg={useColorModeValue("white", "gray.800")}
              boxShadow="md"
            >
              <Skeleton height="200px" mb={4} borderRadius="md" />
              <SkeletonText noOfLines={3} spacing={3} />
              <Skeleton height="40px" mt={4} borderRadius="md" />
            </Box>
          ))}
        </SimpleGrid>
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing={6}>
          {data?.data?.map((product) => (
            <ProductCard
              key={product._id || product.id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}

export default Home;