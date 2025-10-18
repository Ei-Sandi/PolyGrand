"""
AI Service for generating predictions
Mock implementation for MVP - can be replaced with actual ML models
"""

import random
from typing import Dict, List, Optional
from datetime import datetime


class AIService:
    """Service for AI-powered predictions"""

    def __init__(self) -> None:
        """Initialize AI service"""
        self.model_version = "1.0.0-mock"
        self.predictions_generated = 0

    def get_ai_prediction(
        self,
        market_question: str,
        outcomes: List[str],
        historical_data: Optional[Dict] = None
    ) -> Dict[str, float]:
        """
        Generate AI prediction for a market

        Args:
            market_question: The market question
            outcomes: List of possible outcomes
            historical_data: Historical market data (optional)

        Returns:
            Dictionary mapping outcomes to predicted probabilities
        """
        # Mock implementation - generates random but normalized probabilities
        # In production, this would use actual ML models

        # Generate random weights
        weights = [random.random() for _ in outcomes]
        total = sum(weights)

        # Normalize to probabilities (sum to 1.0)
        predictions = {
            outcome: weight / total
            for outcome, weight in zip(outcomes, weights)
        }

        self.predictions_generated += 1

        print(f"🤖 AI Prediction generated for: {market_question[:50]}...")
        for outcome, prob in predictions.items():
            print(f"   {outcome}: {prob:.2%}")

        return predictions

    def get_ai_confidence(self, predictions: Dict[str, float]) -> float:
        """
        Calculate AI confidence score based on prediction distribution

        Args:
            predictions: Outcome probabilities

        Returns:
            Confidence score (0-1)
        """
        # Higher confidence when predictions are more decisive
        # Lower confidence when probabilities are more uniform

        probs = list(predictions.values())
        max_prob = max(probs)
        min_prob = min(probs)

        # Simple confidence metric: difference between max and min
        confidence = max_prob - min_prob

        return confidence

    def benchmark_ai_performance(
        self,
        resolved_markets: List[Dict]
    ) -> Dict[str, float]:
        """
        Benchmark AI performance vs human traders

        Args:
            resolved_markets: List of resolved markets with AI predictions

        Returns:
            Performance metrics
        """
        if not resolved_markets:
            return {
                "ai_accuracy": 0.0,
                "human_accuracy": 0.0,
                "ai_advantage": 0.0,
                "total_markets": 0
            }

        ai_correct = 0
        human_correct = 0

        for market in resolved_markets:
            ai_prediction = market.get("ai_prediction", {})
            resolved_outcome = market.get("resolved_outcome")

            if ai_prediction and resolved_outcome:
                # Check if AI predicted correctly (highest probability outcome)
                ai_top_pick = max(ai_prediction.items(), key=lambda x: x[1])[0]
                if ai_top_pick == resolved_outcome:
                    ai_correct += 1

                # Mock human accuracy (slightly lower than AI for demo)
                if random.random() > 0.45:  # 55% accuracy for humans
                    human_correct += 1

        total = len(resolved_markets)
        ai_accuracy = ai_correct / total if total > 0 else 0
        human_accuracy = human_correct / total if total > 0 else 0

        return {
            "ai_accuracy": ai_accuracy,
            "human_accuracy": human_accuracy,
            "ai_advantage": ai_accuracy - human_accuracy,
            "total_markets": total,
            "ai_correct": ai_correct,
            "human_correct": human_correct
        }

    def analyze_market_sentiment(
        self,
        market_id: str,
        trades: List[Dict]
    ) -> Dict[str, any]:
        """
        Analyze market sentiment based on trading activity

        Args:
            market_id: Market identifier
            trades: List of trades

        Returns:
            Sentiment analysis
        """
        if not trades:
            return {
                "sentiment": "neutral",
                "momentum": 0.0,
                "trader_confidence": 0.5
            }

        # Count trades per outcome
        outcome_volumes = {}
        for trade in trades:
            outcome = trade.get("outcome")
            amount = trade.get("amount", 0)
            outcome_volumes[outcome] = outcome_volumes.get(outcome, 0) + amount

        total_volume = sum(outcome_volumes.values())

        # Calculate sentiment
        if total_volume == 0:
            sentiment = "neutral"
            momentum = 0.0
        else:
            # Most traded outcome indicates sentiment
            top_outcome = max(outcome_volumes.items(), key=lambda x: x[1])
            top_volume_pct = top_outcome[1] / total_volume

            if top_volume_pct > 0.6:
                sentiment = "bullish"
                momentum = top_volume_pct - 0.5
            elif top_volume_pct > 0.4:
                sentiment = "neutral"
                momentum = 0.0
            else:
                sentiment = "bearish"
                momentum = -(0.5 - top_volume_pct)

        return {
            "sentiment": sentiment,
            "momentum": momentum,
            "trader_confidence": len(trades) / 100,  # Simple confidence metric
            "outcome_volumes": outcome_volumes,
            "total_volume": total_volume
        }

    def get_trading_recommendation(
        self,
        market: Dict,
        ai_prediction: Dict[str, float],
        current_prices: Dict[str, float]
    ) -> Dict[str, any]:
        """
        Generate trading recommendation

        Args:
            market: Market data
            ai_prediction: AI predicted probabilities
            current_prices: Current market prices

        Returns:
            Trading recommendation
        """
        recommendations = []

        for outcome in ai_prediction:
            ai_prob = ai_prediction[outcome]
            market_price = current_prices.get(outcome, 0.5)

            # Calculate expected value
            edge = ai_prob - market_price

            if edge > 0.1:  # Significant edge
                recommendations.append({
                    "action": "BUY",
                    "outcome": outcome,
                    "ai_probability": ai_prob,
                    "market_price": market_price,
                    "edge": edge,
                    "confidence": "HIGH"
                })
            elif edge > 0.05:
                recommendations.append({
                    "action": "BUY",
                    "outcome": outcome,
                    "ai_probability": ai_prob,
                    "market_price": market_price,
                    "edge": edge,
                    "confidence": "MEDIUM"
                })
            elif edge < -0.1:
                recommendations.append({
                    "action": "SELL",
                    "outcome": outcome,
                    "ai_probability": ai_prob,
                    "market_price": market_price,
                    "edge": edge,
                    "confidence": "HIGH"
                })

        return {
            "recommendations": recommendations,
            "timestamp": datetime.utcnow().isoformat()
        }


# Global singleton instance
ai_service = AIService()
