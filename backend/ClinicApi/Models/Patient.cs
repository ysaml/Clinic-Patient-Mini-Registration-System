
namespace ClinicApi.Models;
public class Patient
{
   public int Id { get; set; }
   public string Name { get; set; } = string.Empty;
   public DateTime BirthDate { get; set; }
   public string Gender { get; set; } = string.Empty;
   public string ContactNumber { get; set; } = string.Empty;
   public string Address { get; set; } = string.Empty;
}