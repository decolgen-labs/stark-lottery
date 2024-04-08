'use client';

import {
  Button,
  Center,
  Container,
  Flex,
  HStack,
  Icon,
  Spinner,
  Text,
} from '@chakra-ui/react';

import React, { useEffect, useMemo, useState } from 'react';

import PleaseConnectWallet from './PleaseConnectWallet';
import ABITicket from '@/abi/ticket.json';
import { useContract } from '@starknet-react/core';
import { CONTRACT_ADDRESS } from '@/config/contractAddress';
import { convertBigIntsToNumbers } from '@/utils';
import ClaimResult from './ClaimResult';
import EmptyIcon from '@/public/assets/arts/empty.svg';
import { useAuth } from '@/hooks/useAuth';
import { num, uint256 } from 'starknet';

interface TicketUserProps {
  lotteryAddress: string;
  lotteryId: number;
  payOut: number;
  pickedNumbers: number[];
  ticketId: number;
  user: string;
}
const MyTicketPage = () => {
  const { user } = useAuth();

  const [listMyLotteries, setListMyLotteries] = useState<number[]>([]); // List ticket get from contract lottery
  const [listMyTickets, setListMyTickets] = useState<TicketUserProps[]>();
  //Update State loading ticket;
  const [loadingTicket, setLoadingTicket] = useState(true);

  const flatArrayTicket = (inputArray: any) => {
    if (!inputArray) {
      return;
    }

    const value: number[] = [];
    inputArray.forEach((element: BigInt) => {
      value.push(Number(element));
    });

    return value;
  };

  const { contract: contractTicket } = useContract({
    abi: ABITicket,
    address: CONTRACT_ADDRESS.ticket,
  });
  const callUserData = useMemo(() => {
    if (!user || !contractTicket) return setLoadingTicket(true);
    const data = contractTicket?.getUserTickets(user).then((res: any) => {
      const dataFlat = flatArrayTicket(res);
      if (dataFlat) {
        setListMyLotteries(() => dataFlat);
      }
    });
  }, [user, contractTicket]);

  useEffect(() => {
    const getDataTicket = async () => {
      if (!contractTicket || !listMyLotteries) return;
      contractTicket?.getTicketByIds([...listMyLotteries]).then((res: any) => {
        const temp: any = res;

        if (temp) {
          convertBigIntsToNumbers(temp);
          setListMyTickets(() => temp);
        }
        setTimeout(() => {
          setLoadingTicket(false);
        }, 1000);
      });
    };
    getDataTicket();
  }, [contractTicket, listMyLotteries]);
  return (
    <>
      <Container maxWidth="container.xl" minH="80vh">
        {user ? (
          <>
            {loadingTicket ? (
              <>
                <Spinner size="lg" />
              </>
            ) : (
              <Flex flexDirection="column" gap={10} py={10}>
                {listMyTickets?.length !== 0 && listMyTickets ? (
                  <>
                    <Text variant="title">Your Ticket</Text>
                    {listMyTickets
                      .map(data => (
                        <HStack
                          key={`MyTicket-${data.ticketId}`}
                          gap={{ md: 8, base: 6 }}
                          padding={6}
                          bg="#0A1450"
                          borderRadius="3xl"
                          justifyContent="space-between"
                          flexWrap={{ md: 'nowrap', base: 'wrap' }}
                        >
                          <Text variant="title" fontSize="lg">
                            Lottery: #{data.lotteryId}
                          </Text>
                          <Text variant="title" fontSize="lg">
                            TicketID: #{data.ticketId}
                          </Text>
                          <HStack
                            gap={8}
                            flexWrap={{ md: 'nowrap', base: 'wrap' }}
                          >
                            {data.pickedNumbers.map(dataPicked => (
                              <Button
                                variant="lotteryNumber"
                                isActive={true}
                                key={`Myticket-Number-${dataPicked}-${data.ticketId}`}
                              >
                                <Text>{dataPicked}</Text>
                              </Button>
                            ))}
                          </HStack>
                          <ClaimResult
                            key={`Claim-${data.ticketId}`}
                            ticketId={data.ticketId}
                            lotteryId={data.lotteryId}
                            pickedNumber={data.pickedNumbers}
                          />
                        </HStack>
                      ))
                      .reverse()}
                  </>
                ) : (
                  <Center minH="90vh">
                    <Flex
                      flexDirection="column"
                      padding={8}
                      bg="#0A1450"
                      alignItems="center"
                      borderRadius="3xl"
                    >
                      <Icon as={EmptyIcon} height="240px" width="240px" />
                      <Text mt={6} fontSize="2xl" fontWeight="bold" mb={3}>
                        No tickets found
                      </Text>
                      <Text color="#7A8CFF">
                        Looks like you haven’t added anything to your cart yet!
                      </Text>
                    </Flex>
                  </Center>
                )}
              </Flex>
            )}
          </>
        ) : (
          <PleaseConnectWallet />
        )}
      </Container>
    </>
  );
};

export default MyTicketPage;
