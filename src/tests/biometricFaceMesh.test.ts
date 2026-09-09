import { describe, it, expect } from 'vitest';
import { 
  generateFaceMeshLandmarks, 
  cosineSimilarity, 
  euclideanDistance, 
  calculateFaceMatchConfidence 
} from '../services/biometricService';

describe('Pilar 1: 3D FaceMesh & Biometric Similarity Engine', () => {
  it('should generate exactly 468 3D landmark points for facial geometry', () => {
    const landmarks = generateFaceMeshLandmarks(160, 200, 1.0);
    expect(landmarks).toHaveLength(468);
    expect(landmarks[0]).toHaveProperty('x');
    expect(landmarks[0]).toHaveProperty('y');
    expect(landmarks[0]).toHaveProperty('z');
  });

  it('should accurately calculate cosine similarity between identical and orthogonal vectors', () => {
    const vecA = [0.5, 0.5, 0.5, 0.5];
    const vecB = [0.5, 0.5, 0.5, 0.5];
    const vecC = [-0.5, -0.5, -0.5, -0.5];

    expect(cosineSimilarity(vecA, vecB)).toBeCloseTo(1.0, 4);
    expect(cosineSimilarity(vecA, vecC)).toBeCloseTo(-1.0, 4);
  });

  it('should compute Euclidean distance between descriptor points', () => {
    const p1 = [0, 0, 0];
    const p2 = [3, 4, 0];
    expect(euclideanDistance(p1, p2)).toBe(5);
  });

  it('should compute high match confidence (>95%) for matching facial descriptors', () => {
    const probe = [0.8, 0.2, 0.5, 0.9, 0.1];
    const stored = [0.81, 0.19, 0.51, 0.89, 0.11];
    const confidence = calculateFaceMatchConfidence(probe, stored, 0.98);
    expect(confidence).toBeGreaterThan(95.0);
    expect(confidence).toBeLessThanOrEqual(99.9);
  });
});
