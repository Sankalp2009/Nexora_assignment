import React, { useState } from "react";
import {
  Box,
  Text,
  Heading,
  Flex,
  VStack,
  useToast,
  Input,
  Button,
  Divider,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";

import { ShoppingCart, CheckCircle, Sparkles } from "lucide-react";

import CartItem from "../Component/CartItem.jsx";

import useSWR from "swr";
import { useSWRConfig } from "swr";

const fetcher = (...args) => fetch(...args).then((res) => res.json());

const API_URL = "http://127.0.0.1:5000/api/cart";

const Cart = () => {
  const { data, error, isLoading } = useSWR(API_URL, fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 0,
  });

  const { mutate } = useSWRConfig();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutTotal, setCheckoutTotal] = useState(0);

  const handleCheckout = async () => {
    if (!name || !email) {
      toast({
        title: "Please fill all fields",
        status: "warning",
        duration: 2000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    setIsCheckingOut(true);
    try {
      // Save total before checkout (since cart will be cleared)
      setCheckoutTotal(total);

      const response = await fetch(`http://127.0.0.1:5000/api/cart/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      const result = await response.json();
      if (result.status === "success") {
        // Show success modal first
        onOpen();

        // Revalidate cart data after modal is shown
        mutate(API_URL);
      }
    } catch (error) {
      toast({
        title: "Checkout failed",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleCloseModal = () => {
    // Clear form when modal closes
    setName("");
    setEmail("");
    setCheckoutTotal(0);
    onClose();
  };

  if (error)
    return (
      <Box textAlign="center" py={10}>
        <Heading color="red.500">Failed to load cart 😞</Heading>
      </Box>
    );

  if (isLoading)
    return (
      <Flex align="center" justify="center" minH="50vh">
        <Spinner size="xl" color="purple.500" />
      </Flex>
    );

  const items = data?.data?.items || [];
  const total = data?.data?.total || 0;

  // Show empty cart only if modal is not open
  if (items.length === 0 && !isOpen)
    return (
      <Box maxW="7xl" mx="auto" px={8} py={12}>
        <VStack spacing={6}>
          <ShoppingCart size={64} color="#CBD5E0" />
          <Heading size="lg" color="gray.600">
            Your cart is empty
          </Heading>
          <Text color="gray.500">Add some products to get started!</Text>
        </VStack>
      </Box>
    );

  return (
    <>
      <Box maxW="7xl" mx="auto" px={8} py={8}>
        <Flex gap={8} direction={{ base: "column", lg: "row" }}>
          <VStack flex="1" spacing={4} align="stretch">
            <Heading size="lg" mb={2}>
              Shopping Cart ({items.length} items)
            </Heading>

            {items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </VStack>

          <Box
            w={{ base: "full", lg: "400px" }}
            bg="gray.50"
            p={6}
            borderRadius="lg"
            h="fit-content"
            position="sticky"
            top="100px"
          >
            <Heading size="md" mb={4}>
              Order Summary
            </Heading>

            <VStack spacing={3} align="stretch" mb={6}>
              <Flex justify="space-between">
                <Text>Subtotal</Text>
                <Text fontWeight="600">₹{(total / 100).toFixed(2)}</Text>
              </Flex>
              <Divider />
              <Flex justify="space-between" fontSize="xl" fontWeight="700">
                <Text>Total</Text>
                <Text color="purple.600">₹{(total / 100).toFixed(2)}</Text>
              </Flex>
            </VStack>

            <VStack spacing={3} mb={4}>
              <Input
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                placeholder="Your Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </VStack>

            <Button
              colorScheme="purple"
              w="full"
              size="lg"
              onClick={handleCheckout}
              isLoading={isCheckingOut}
              loadingText="Processing..."
            >
              Checkout
            </Button>
          </Box>
        </Flex>
      </Box>

      {/* Success Modal */}
      <Modal
        isOpen={isOpen}
        onClose={handleCloseModal}
        isCentered
        size={{ base: "sm", md: "md" }}
        closeOnOverlayClick={false}
      >
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <ModalContent mx={{ base: 4, md: 0 }}>
          <ModalHeader>
            <Flex align="center" justify="center" gap={2}>
              <CheckCircle size={28} color="green" />
              <Text fontSize={{ base: "lg", md: "xl" }}>
                Order Placed Successfully!
              </Text>
            </Flex>
          </ModalHeader>
          <ModalCloseButton onClick={handleCloseModal} />

          <ModalBody pb={6}>
            <Flex
              direction="column"
              align="center"
              gap={4}
              py={{ base: 4, md: 6 }}
            >
              {/* Sparkle Animation */}
              <Box position="relative">
                <Box
                  animation="sparkle 1.5s ease-in-out infinite"
                  position="absolute"
                  top="-10px"
                  left="-10px"
                >
                  <Sparkles size={24} color="#FFD700" />
                </Box>
                <Box
                  animation="sparkle 1.5s ease-in-out infinite 0.5s"
                  position="absolute"
                  top="-10px"
                  right="-10px"
                >
                  <Sparkles size={24} color="#FFD700" />
                </Box>
                <Box
                  animation="sparkle 1.5s ease-in-out infinite 1s"
                  position="absolute"
                  bottom="-10px"
                  left="50%"
                  transform="translateX(-50%)"
                >
                  <Sparkles size={24} color="#FFD700" />
                </Box>

                <CheckCircle size={80} color="#22c55e" strokeWidth={2} />
              </Box>

              <Text
                fontSize={{ base: "md", md: "lg" }}
                textAlign="center"
                fontWeight="medium"
              >
                Thank you for your order!
              </Text>
              <Text
                fontSize={{ base: "xs", md: "sm" }}
                color="gray.600"
                textAlign="center"
                px={{ base: 2, md: 0 }}
              >
                Your order has been successfully placed.
                <br />
                Order total: <strong>₹{(checkoutTotal / 100).toFixed(2)}</strong>
              </Text>
              {email && (
                <Text fontSize="xs" color="gray.500" textAlign="center">
                  A confirmation email has been sent to {email}
                </Text>
              )}
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Add sparkle animation styles */}
      <style>
        {`
          @keyframes sparkle {
            0%, 100% {
              opacity: 0;
              transform: scale(0.5) rotate(0deg);
            }
            50% {
              opacity: 1;
              transform: scale(1.2) rotate(180deg);
            }
          }
        `}
      </style>
    </>
  );
};

export default Cart;