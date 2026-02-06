import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Camera } from 'expo-camera';

interface IDCardScannerProps {
  visible: boolean;
  onClose: () => void;
  onScanSuccess: (data: string) => void;
  expectedId: string;
}

export const IDCardScanner: React.FC<IDCardScannerProps> = ({
  visible,
  onClose,
  onScanSuccess,
  expectedId,
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  React.useEffect(() => {
    if (visible) {
      requestCameraPermission();
    }
  }, [visible]);

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const handleManualEntry = () => {
    // For demo purposes, automatically use the expected ID
    Alert.alert(
      'Manual Entry',
      `আপনার Student ID: ${expectedId}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Verify', 
          onPress: () => {
            onScanSuccess(expectedId);
          }
        }
      ]
    );
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    console.log('Scanned data:', data);
    onScanSuccess(data);
  };

  if (!visible) return null;

  if (hasPermission === null) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.centeredView}>
          <Text>Requesting camera permission...</Text>
        </View>
      </Modal>
    );
  }

  if (hasPermission === false) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.centeredView}>
          <Text style={styles.title}>আইডি কার্ড যাচাইকরণ</Text>
          <Text style={styles.message}>
            ক্যামেরা অ্যাক্সেস প্রয়োজন আইডি কার্ড স্ক্যান করার জন্য
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleManualEntry}>
            <Text style={styles.buttonText}>ম্যানুয়াল এন্ট্রি</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>বন্ধ করুন</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>আইডি কার্ড স্ক্যান করুন</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {Platform.OS !== 'web' ? (
          <Camera
            style={styles.camera}
            onBarCodeScanned={handleBarCodeScanned}
            barCodeScannerSettings={{
              barCodeTypes: ['qr'],
            }}
          >
            <View style={styles.overlay}>
              <View style={styles.scanFrame} />
              <Text style={styles.instruction}>
                আপনার আইডি কার্ডের QR কোড ফ্রেমের মধ্যে রাখুন
              </Text>
            </View>
          </Camera>
        ) : (
          <View style={styles.webFallback}>
            <Text style={styles.webText}>ওয়েব ভার্সনে ক্যামেরা স্ক্যানিং উপলব্ধ নেই</Text>
            <TouchableOpacity style={styles.button} onPress={handleManualEntry}>
              <Text style={styles.buttonText}>ম্যানুয়াল এন্ট্রি</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.footer}>
          <TouchableOpacity style={styles.manualButton} onPress={handleManualEntry}>
            <Text style={styles.manualButtonText}>ম্যানুয়াল এন্ট্রি</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    padding: 10,
  },
  closeButtonText: {
    fontSize: 18,
    color: 'white',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  instruction: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  footer: {
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  manualButton: {
    backgroundColor: '#1a472a',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  manualButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  button: {
    backgroundColor: '#1a472a',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  webFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  webText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
});