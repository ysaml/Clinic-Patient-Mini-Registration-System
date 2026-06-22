
namespace ClinicApi.Models;
public class Patient
{
   public int Id { get; set; }
   public string FullName { get; set; } = string.Empty;
   public string FirstName { get; set; } = string.Empty;
   public string MiddleName { get; set; } = string.Empty;
   public string LastName { get; set; } = string.Empty;
   public DateTime BirthDate { get; set; }
   public string Gender { get; set; } = string.Empty;
   public string ContactNumber { get; set; } = string.Empty;
   public string Address { get; set; } = string.Empty;
}