// app/page.tsx
'use client'
import {
  Card,
  CardHeader,
  CardBody,
  Box,
  Text,
  Grid,
  Stack,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableContainer,
  border,
  NumberInput,
  Input,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Measurement } from "@/controllers/measurements";
import io from 'socket.io-client';

interface ArduinoData {
  joules: string;
  speed: string;
  caliber: string;
  fps: string;
}

export default function Page() {
  const socket = io('http://localhost:9000')
  const [dataArray, setDataArray] = useState<ArduinoData[]>([]);
  const [joules, setJoules] = useState<String>("0");
  const [speed, setSpeed] = useState<String>("0");
  const [caliber, setCaliber] = useState<String>("0");
  const [fps, setFps] = useState<String>("0");
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [measurements, setMeasurements] = useState<Measurement[]>([]);  

  async function fetchMeasurements() {
    try {
      const response = await fetch('/api/measurements', { method: 'GET' });
      if (!response.ok) {
        throw new Error('Failed to fetch measurements');
      }
      const data = await response.json();
      setMeasurements(data.measurements);
      console.log(`Fetched [${data.measurements.length}] measurements successfully`);

    } catch (error) {
      console.error('Error fetching measurements:', error);
    }
  }

  useEffect(() => {
    socket.on('serial:data', async (data: ArduinoData) => {
      console.log(data);
      setJoules(data.joules);
      setSpeed(data.speed);
      setCaliber(data.caliber);
      setFps(data.fps);

      setDataArray((prevData) => [...prevData, data]);
    });

    return () => {
      socket.off('serial:data');
      socket.disconnect();
    };
  }, [socket]);

  const handleClick = async () => {

    const dataToSend = dataArray.map((data) => {
      const joulesValue = parseFloat(data.joules);
      const speedValue = parseFloat(data.speed);
      const caliberValue = parseFloat(data.caliber);
      const fpsValue = parseFloat(data.fps);

      if (isNaN(joulesValue) || isNaN(speedValue) || isNaN(caliberValue) || isNaN(fpsValue)) {
        console.error('Dados inválidos recebidos:', data);
        return null; // ou qualquer outra lógica de tratamento de erro
      }

      return {
        joules: joulesValue,
        speed: speedValue,
        caliber: caliberValue,
        fps: fpsValue,
      };
    }).filter(data => data !== null); // Filtra os dados inválidos

    try {    
      if (dataToSend.length === 0) {
        console.error('Nenhum dado para enviar.');
        return;
      }
      const response = await fetch('/api/measurements', {

        method: 'POST',
        body: JSON.stringify(
          dataToSend
        ),
      });

      if (!response.ok) {
        throw new Error('Falha ao enviar medições');
      }
      
      console.log('Medições enviadas com sucesso!');
      
      setDataArray([]);  
      
    } catch (error) {
      console.error('Erro ao enviar medições:', error);
    } finally {         
      fetchMeasurements();
      onOpen();
    }
  };

  return (
    <Box minW="100vw" minH="100vh" display="flex" justifyContent="center" alignItems="center" bg="#161616">
      <Card maxW="sm" mx="auto" bg="#303030">
        <CardHeader borderBottom="1px" borderColor="gray.200">
          <Box px={6} py={4}>
            <Text fontSize="lg" fontWeight="medium" color="#CECFCF">
              CRONÓGRAFO PARA AIRSOFT
            </Text>
          </Box>
        </CardHeader>
        <CardBody p={0}>
          <Grid gap={0}>
            <Stack spacing={2} px={6} py={6}>
              <Stack direction="row" justifyContent="space-between" fontSize="sm" fontWeight="medium" color="gray.500">
                <Text color="#CECFCF">Joules(J)</Text>
                <NumberInput color="#CECFCF" >{joules}</NumberInput>
              </Stack>
              <Stack direction="row" justifyContent="space-between" fontSize="sm" fontWeight="medium" color="gray.500">
                <Text color="#CECFCF">Speed (m/s)</Text>
                <NumberInput color="#CECFCF" >{speed}</NumberInput>
              </Stack>
              <Stack direction="row" justifyContent="space-between" fontSize="sm" fontWeight="medium" color="gray.500">
                <Text color="#CECFCF">Calibre (mm)</Text>
                <NumberInput color="#CECFCF" >{caliber}</NumberInput>
              </Stack>
              <Stack direction="row" justifyContent="space-between" fontSize="sm" fontWeight="medium" color="gray.500">
                <Text color="#CECFCF">FPS</Text>
                <NumberInput color="#CECFCF" >{fps}</NumberInput>
              </Stack>
            </Stack>
            <Box borderTop="1px" borderColor="gray.200" />
            <Stack px={6} py={6} direction="row" justifyContent="center">
              <Button onClick={handleClick} size="sm">Resultados</Button>

            </Stack>
          </Grid>
        </CardBody>
      </Card>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Histórico de Medição</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <TableContainer>
              <Table variant='simple'>
                <Thead>
                  <Tr>
                    <Th isNumeric>Joule(j)</Th>
                    <Th isNumeric>Speed(m/s)</Th>
                    <Th isNumeric>Calibre(mm)</Th>
                    <Th isNumeric>FPS</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {measurements?.map((measurement) => (
                    <Tr key={measurement.id}>
                      <Td isNumeric>{measurement.joules}</Td>
                      <Td isNumeric>{measurement.speed}</Td>
                      <Td isNumeric>{measurement.caliber}</Td>
                      <Td isNumeric>{measurement.fps}</Td>
                    </Tr>
                  ))}
                </Tbody>

              </Table>
            </TableContainer>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={onClose}>
              Fechar
            </Button>

          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>


  );
}
