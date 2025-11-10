import React, { useState } from "react";
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Image,
  IconButton,
  Input,
  useToast,
} from "@chakra-ui/react";
import { Plus, Minus, Trash2 } from "lucide-react";
import { useSWRConfig } from "swr";

const CartItem = ({ item }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const toast = useToast();
  const { mutate } = useSWRConfig();

  const updateQuantity = async (newQty) => {
    if (newQty < 0) return;
    setIsUpdating(true);

    try {
      const response = await fetch(`http://127.0.0.1:5000/api/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: item.productId,
          qty: newQty,
        }),
      });

      const result = await response.json();
      if (result.status === "success") {
        mutate(`http://127.0.0.1:5000/api/cart`);
        if (newQty === 0) {
          toast({
            title: "Removed from cart",
            status: "info",
            duration: 2000,
            position: "top-right",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error updating quantity",
        description: error.message,
        status: "error",
        duration: 3000,
        position: "top-right",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteItem = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/cart/${item._id}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (result.status === "success") {
        mutate(`http://127.0.0.1:5000/api/cart`);
        toast({
          title: "Item removed",
          status: "info",
          duration: 2000,
          position: "top-right",
        });
      }
    } catch (error) {
      toast({
        title: "Error removing item",
        description: error.message,
        status: "error",
        duration: 3000,
        position: "top-right",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Flex
      gap={4}
      p={4}
      bg="white"
      borderRadius="lg"
      borderWidth="1px"
      align="center"
      opacity={isUpdating ? 0.6 : 1}
      pointerEvents={isUpdating ? "none" : "auto"}
    >
      <Box
        w="100px"
        h="100px"
        bg="gray.100"
        borderRadius="md"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Image
          src={item.image}
          alt={item.name}
          maxH="90px"
          objectFit="contain"
        />
      </Box>

      <VStack flex="1" align="start" spacing={1}>
        <Text fontWeight="600" fontSize="lg">
          {item.name}
        </Text>
        <Text color="purple.600" fontWeight="600">
          ₹{(item.price / 100).toFixed(2)}
        </Text>
      </VStack>

      <HStack spacing={2}>
        <IconButton
          size="sm"
          icon={<Minus size={16} />}
          onClick={() => updateQuantity(item.qty - 1)}
          isDisabled={item.qty <= 1 || isUpdating}
          aria-label="Decrease quantity"
        />
        <Input
          value={item.qty}
          readOnly
          w="60px"
          textAlign="center"
          size="sm"
        />
        <IconButton
          size="sm"
          icon={<Plus size={16} />}
          onClick={() => updateQuantity(item.qty + 1)}
          isDisabled={isUpdating}
          aria-label="Increase quantity"
        />
      </HStack>

      <VStack spacing={2} align="end">
        <Text fontWeight="700" fontSize="lg">
          ₹{(item.price / 100).toFixed(2)}
        </Text>
        <IconButton
          size="sm"
          colorScheme="red"
          variant="ghost"
          icon={<Trash2 size={18} />}
          onClick={deleteItem}
          isDisabled={isUpdating}
          aria-label="Remove item"
        />
      </VStack>
    </Flex>
  );
};

export default CartItem;