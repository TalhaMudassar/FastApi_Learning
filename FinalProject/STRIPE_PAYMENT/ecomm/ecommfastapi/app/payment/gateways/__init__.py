from app.payment.models import PaymentGatewayEnum
from app.payment.gateways.base import BasePaymentGateway, GatewayPaymentResult
from app.payment.gateways.mock import MockPaymentGateway
from app.payment.gateways.stripe import StripePaymentGateway

def get_payment_gateway(gateway_type: PaymentGatewayEnum | str) -> BasePaymentGateway:
    """
    Factory to retrieve the appropriate payment gateway instance.
    """
    if isinstance(gateway_type, str):
        try:
            gateway_type = PaymentGatewayEnum(gateway_type)
        except ValueError as exc:
            raise ValueError(f"Unsupported payment gateway: {gateway_type}") from exc

    if gateway_type == PaymentGatewayEnum.mock:
        return MockPaymentGateway()
    elif gateway_type == PaymentGatewayEnum.stripe:
        return StripePaymentGateway()
    else:
        raise ValueError(f"Unsupported payment gateway: {gateway_type}")

__all__ = [
    "BasePaymentGateway",
    "GatewayPaymentResult",
    "MockPaymentGateway",
    "StripePaymentGateway",
    "get_payment_gateway",
]
